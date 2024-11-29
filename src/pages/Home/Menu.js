import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import '../../css/Menu.css';

function Menu({ setActivePage }) {
    const [storeInfo, setStoreInfo] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [menuError, setMenuError] = useState("");
    const [newMenu, setNewMenu] = useState({ name: '', price: '', image: null });
    const [previewImage, setPreviewImage] = useState(null);
    const [isMenuFormVisible, setIsMenuFormVisible] = useState(false);
    const [selectedMenus, setSelectedMenus] = useState([]); // 선택된 메뉴를 관리하는 상태

    const [editMenu, setEditMenu] = useState(null); // 수정할 메뉴 저장
    const [editPreviewImage, setEditPreviewImage] = useState(null); // 수정 이미지 미리보기

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Display 5 items per page
    const location = useLocation();
    console.log(location.state);
    const storedStoreId = localStorage.getItem("storeId");
    const storedToken = localStorage.getItem("token");
    const { storeId, token } = location.state || {
        storeId: storedStoreId,
        token: storedToken,
    };

    const [insertCheck, setinsertCheck] = useState(false);
    const [deleteCheck, setdeleteCheck] = useState(false);
    const [editCheck, seteditCheck] = useState(false);

    const navigate = useNavigate();

    //가게 정보 불러오기
    useEffect(() => {
        if (!storeId || !token) {
            setErrorMessage("유효한 storeId와 token이 전달되지 않았습니다.");
            setIsLoading(false);
            return;
        }

        const fetchStoreDetails = async () => {
            try {
                const url = `/ROOT/api/store/detail/${storeId}`;
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.status === 200) {
                    setStoreInfo(response.data.result);
                } else {
                    setErrorMessage("가게 정보를 불러오는 데 실패했습니다.");
                }
            } catch (error) {
                setErrorMessage("가게 정보를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStoreDetails();
    }, [storeId, token]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewMenu((prev) => ({ ...prev, image: file }));
            setPreviewImage(URL.createObjectURL(file)); // 이미지 미리보기 설정
        }
    };

    //메뉴 리스트
    useEffect(() => {
        const fetchMenuList = async () => {
            try {
                const response = await axios.get('/ROOT/api/menu/list', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.status === 200) {
                    const sortedMenuItems = response.data.menuList.sort((a, b) => b.menuNo - a.menuNo);
                    setMenuItems(sortedMenuItems);
                } else {
                    setMenuError("메뉴 조회에 실패했습니다.");
                }
            } catch (error) {
                setMenuError("메뉴 목록을 불러오는 중 오류가 발생했습니다.");
            }
        };

        fetchMenuList();
    }, [token, insertCheck, deleteCheck, editCheck]);

    const handleCheckboxChange = (menuNo) => {
        setSelectedMenus((prevSelectedMenus) => {
            if (prevSelectedMenus.includes(menuNo)) {
                // 메뉴가 이미 선택되어 있으면 제거
                return prevSelectedMenus.filter((id) => id !== menuNo);
            } else {
                // 메뉴가 선택되지 않았으면 추가
                return [...prevSelectedMenus, menuNo];
            }
        });
    };

    const handleAddToDailyMenu = async () => {
        if (selectedMenus.length === 0) {
            alert("선택된 메뉴가 없습니다.");
            return;
        }

        try {

            // 선택된 메뉴가 비어있지 않은지 확인
            console.log("선택된 메뉴 번호들:", selectedMenus);

            if (!selectedMenus || selectedMenus.length === 0) {
                alert("선택된 메뉴가 없습니다. 메뉴를 선택해 주세요.");
                return;
            }

            const response = await axios.post(
                `/ROOT/api/menu/daily/add`,
                { menuNos: selectedMenus }, // 선택된 메뉴 번호들을 전송
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.status === 200) {
                alert("데일리 메뉴가 추가되었습니다!");
                // 페이지 전환
                setActivePage('DAILY_MENU');// 데일리 메뉴 페이지로 이동
            } else {
                console.error('Error:', response.data.message);  // 오류 메시지 확인
                alert("데일리 메뉴 추가 실패");
            }
        } catch (error) {
            console.error("API 요청 중 오류 발생:", error);  // 오류 내용 출력
            alert("데일리 메뉴 추가 중 오류 발생");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewMenu((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditMenu((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditMenu((prev) => ({ ...prev, image: file }));
            setEditPreviewImage(URL.createObjectURL(file));
        }
    };

    //메뉴 추가하기
    const handleAddMenu = async (e) => {
        e.preventDefault();

        if (!newMenu.name || !newMenu.price) {
            alert('모든 필드를 입력해주세요!');
            return;
        }

        const formData = new FormData();
        formData.append(
            'menu',
            JSON.stringify({
                name: newMenu.name,
                price: newMenu.price,
            })
        );
        if (newMenu.image) {
            formData.append('file', newMenu.image);
        }

        try {
            const response = await axios.post('/ROOT/api/menu/add.do', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.status === 200) {
                alert('메뉴가 추가되었습니다!');

                setNewMenu({
                    name: '',
                    price: '',
                    image: null,
                });

                setPreviewImage(null);
                document.getElementById("imageInput").value = "";

                setinsertCheck((prev) => (!prev));
            } else {
                console.error('메뉴 추가 실패:', response.data.message);
            }
        } catch (error) {
            console.error('메뉴 추가 오류:', error.message);
        }
    };

    //메뉴 수정하기
    const handleEditMenuSubmit = async (e) => {
        e.preventDefault();
        if (!editMenu) return;

        try {
            const formData = new FormData();
            formData.append(
                'menu',
                new Blob([JSON.stringify({ name: editMenu.name, price: editMenu.price })], {
                    type: 'application/json'
                })
            );
            if (editMenu.image) {
                formData.append('file', editMenu.image); // 이미지를 선택했을 경우 추가
            }

            const response = await axios.put(
                `/ROOT/api/menu/update/${editMenu.menuNo}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // 인증 토큰
                    },
                }
            );

            if (response.status === 200) {
                alert('메뉴가 수정되었습니다!');
                seteditCheck((prev) => (!prev));
                setEditMenu(null);
            } else {
                console.error('메뉴 수정 실패:', response.data.message);
            }
        } catch (error) {
            console.error('메뉴 수정 오류:', error.message);
        }
    };


    //메뉴 삭제하기
    const handleDeleteMenu = async (menuNo) => {
        if (window.confirm('정말 삭제하시겠습니까? 해당 메뉴는 DAILY MENU에서도 삭제됩니다.')) {
            try {
                const response = await axios.delete(`/ROOT/api/menu/delete/${menuNo}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.status === 200) {
                    alert('메뉴 삭제 성공');
                    setdeleteCheck((prev) => (!prev));
                } else {
                    alert('메뉴 삭제 실패');
                }
            } catch (error) {
                console.error('메뉴 삭제 오류:', error.message);
            }
        }
    };

    //메뉴 페이징
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (isLoading) { return <div className="loading">로딩 중...</div>; }
    if (errorMessage) { return <div className="error">{errorMessage}</div>; }

    const currentMenuItems = menuItems.slice(
        (currentPage - 1) * 5,
        currentPage * 5
    );

    return (
        <div className="menu-container">
            <h2 className="add">ADD MENU</h2>
            <div className="menu-insert-container">
                {/* <button className="toggle-menu-form" onClick={toggleMenuForm}>
                    {isMenuFormVisible ? "▲ CLOSE" : "▽ OPEN ADD MENU"}
                </button> */}
                {/* {isMenuFormVisible && ( */}
                <form className="menu-form" onSubmit={handleAddMenu}>
                    <div className="form-row">
                        <label>메뉴명</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="메뉴명"
                            value={newMenu.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-row">
                        <label>가격</label>
                        <input
                            type="text"
                            name="price"
                            placeholder="가격"
                            value={newMenu.price}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-row">
                        <label>이미지</label>
                        <input type="file" onChange={handleImageChange} id="imageInput" />
                    </div>
                    {previewImage && (
                        <div className="image-preview">
                            <p>이미지 미리보기</p>
                            <img src={previewImage} alt="미리보기" />
                        </div>
                    )}
                    <button type="submit" className="menu-submit-btn">
                        추가
                    </button>
                </form>
                {/* )} */}
            </div>

            <div className="menu-list">
                <h2>MENU LIST</h2>
                {menuError ? (
                    <p>{menuError}</p>
                ) : (
                    <ul>
                        {currentMenuItems.map((menuItem) => (
                            <li className="menu-item" key={menuItem.menuNo}>
                                <input
                                    type="checkbox"
                                    onChange={() => handleCheckboxChange(menuItem.menuNo)}
                                    checked={selectedMenus.includes(menuItem.menuNo)}
                                />
                                <div className="menu-photo">
                                    {menuItem.imageurl && (
                                        <img
                                            src={`http://localhost:8080${menuItem.imageurl}`}
                                            alt={menuItem.menuName || "메뉴 이미지"}
                                        />
                                    )}
                                </div>
                                <div className="menu-info">
                                    <h3 className="menu-name">{menuItem.name}</h3>
                                    <p className="menu-price">{menuItem.price} 원</p>
                                    <div className="menu-actions">
                                        <button
                                            className="edit-button"
                                            onClick={() => {
                                                setEditMenu(menuItem);
                                                setEditPreviewImage(null);
                                            }}
                                        >
                                            수정
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDeleteMenu(menuItem.menuNo)}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button onClick={handleAddToDailyMenu} className="add-to-daily-btn">
                데일리 메뉴로 추가
            </button>

            {editMenu && (
                <div className="edit-menu-modal">
                    <div className="edit-menu-content">
                        <h2>메뉴 수정</h2>
                        <form onSubmit={handleEditMenuSubmit}>
                            <div className="form-row">
                                <label>메뉴명</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={editMenu.name}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                            <div className="form-row">
                                <label>가격</label>
                                <input
                                    type="text"
                                    name="price"
                                    value={editMenu.price}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                            <div className="form-row">
                                <label>이미지</label>
                                <input type="file" onChange={handleEditImageChange} />
                            </div>
                            <div className="image-preview-container">
                                {editMenu.imageurl && (
                                    <div className="image-preview">
                                        <p>현재 이미지</p>
                                        <img
                                            src={`http://localhost:8080${editMenu.imageurl}`}
                                            alt="기존 이미지"
                                        />
                                    </div>
                                )}
                                {editPreviewImage && (
                                    <div className="image-preview">
                                        <p>새 이미지</p>
                                        <img src={editPreviewImage} alt="새 이미지 미리보기" />
                                    </div>
                                )}
                            </div>
                            <div className="form-actions">
                                <button type="submit">수정 완료</button>
                                <button type="button" onClick={() => setEditMenu(null)}>취소</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="pagination">
                {Array.from({ length: Math.ceil(menuItems.length / itemsPerPage) }, (_, index) => (
                    <button
                        key={index + 1}
                        className={currentPage === index + 1 ? "active" : ""}
                        onClick={() => handlePageChange(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Menu;
