import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const DailyMenu = () => {
    const [dailyMenu, setDailyMenu] = useState([]);
    const [date, setDate] = useState(""); // 메뉴를 조회할 날짜
    const [errorMessage, setErrorMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null); // 수정할 메뉴 정보
    const [newPrice, setNewPrice] = useState(""); // 수정할 가격
    const [newQty, setNewQty] = useState(""); // 수정할 수량

    // localStorage에서 토큰을 직접 가져옴
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!date) {
            // 현재 날짜로 자동 설정
            const today = new Date();
            const currentDate = today.toISOString().split('T')[0]; // yyyy-MM-dd 형식
            setDate(currentDate); // 날짜를 상태에 저장
        }
    }, [date]);  // date 값이 변경될 때만 실행되도록 설정

    useEffect(() => {

        if (date && token) {
            fetchDailyMenu(); // 날짜가 설정된 후 메뉴를 가져옵니다.
        }
    }, [date, token]);  // token과 date가 변경될 때마다 fetchDailyMenu 호출

    // 데일리 메뉴 데이터 가져오기
    const fetchDailyMenu = async () => {
        try {
            const response = await axios.get('/ROOT/api/menu/daily/storelist', {
                headers: { Authorization: `Bearer ${token}` },
                params: { date }
            });

            if (response.data && Array.isArray(response.data)) {
                // 서버에서 반환한 data가 배열인 경우
                setDailyMenu(response.data);  // 배열을 상태에 저장
            } else {
                setErrorMessage("데일리 메뉴를 불러오는 데 실패했습니다.");
            }
        } catch (error) {
            setErrorMessage("데일리 메뉴를 불러오는 중 오류가 발생했습니다.");
        }
    };

    // 수정 버튼 클릭 시 모달 열기
    const openModal = (menuItem) => {
        setSelectedMenu(menuItem);
        setNewPrice(menuItem.menuDiscountedPrice); // 기존 판매가로 초기화
        setNewQty(menuItem.menuQty); // 기존 수량으로 초기화
        setModalVisible(true);
    };

    // 수정된 메뉴 데이터 서버로 전송
    const updateMenu = async () => {
        if (newPrice === "" || newQty === "") {
            setErrorMessage("모든 필드를 입력하세요.");
            return;
        }

        const updatedMenu = {
            dailymenuNo: selectedMenu.dailymenuNo,
            price: newPrice,
            qty: newQty
        };

        try {
            const response = await axios.put('/ROOT/api/menu/daily/update', [updatedMenu], {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 200) {
                setModalVisible(false);
                fetchDailyMenu(); // 메뉴 목록 갱신
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            setErrorMessage("메뉴 수정 중 오류가 발생했습니다.");
        }
    };

    // 메뉴 삭제
    const deleteMenu = async (dailymenuNo) => {
        // 삭제 확인 알림
        const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
        if (!confirmDelete) return;  // 사용자가 취소를 선택하면 삭제하지 않음
        try {
            const response = await axios.delete('/ROOT/api/menu/daily/delete', {
                headers: { Authorization: `Bearer ${token}` },
                data: [dailymenuNo]
            });

            if (response.data.status === 200) {
                fetchDailyMenu(); // 삭제 후 메뉴 목록 갱신
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            setErrorMessage("메뉴 삭제 중 오류가 발생했습니다.");
        }
    };

    return (
        <div>
            <h2>데일리 메뉴</h2>
            {errorMessage && <p>{errorMessage}</p>}
            <ul>
                {dailyMenu.map((menuItem) => (
                    <li key={menuItem.dailymenuNo}>
                        <img
                            src={`http://localhost:8080${menuItem.menuImageUrl}`}
                            alt={menuItem.menuName}
                            style={{ width: "50px", height: "50px" }}
                        />
                        <p>{menuItem.menuName}</p>
                        <p>원가 : {menuItem.menuPrice} 원</p>
                        <p>판매가 : {menuItem.menuDiscountedPrice} 원</p>
                        <p>판매가능수량 : {menuItem.menuQty} 개</p>
                        <button onClick={() => openModal(menuItem)}>수정</button>
                        <button onClick={() => deleteMenu(menuItem.dailymenuNo)}>삭제</button>
                    </li>
                ))}
            </ul>

            {/* 수정 모달 */}
            {modalVisible && selectedMenu && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>메뉴 수정</h3>
                        <img
                            src={`http://localhost:8080${selectedMenu.menuImageUrl}`}
                            alt={selectedMenu.menuName}
                            style={{ width: "50px", height: "50px" }}
                        />
                        <p>메뉴 이름: {selectedMenu.menuName}</p>
                        <p>원가: {selectedMenu.menuPrice} 원</p>
                        <label>
                            판매가:
                            <input
                                type="number"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                            />
                        </label>
                        <br />
                        <label>
                            판매가능수량:
                            <input
                                type="number"
                                value={newQty}
                                onChange={(e) => setNewQty(e.target.value)}
                            />
                        </label>
                        <br />
                        <button onClick={updateMenu}>수정 완료</button>
                        <button onClick={() => setModalVisible(false)}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyMenu;
