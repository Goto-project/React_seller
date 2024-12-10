import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import '../../css/DailyMenu.css'; // Import external CSS file for styling

const DailyMenu = () => {
    const [dailyMenu, setDailyMenu] = useState([]);
    const [date, setDate] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [newPrice, setNewPrice] = useState("");
    const [newQty, setNewQty] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!date) {
            const today = new Date();
            const currentDate = today.toISOString().split('T')[0];
            setDate(currentDate);
        }
    }, [date]);

    useEffect(() => {
        if (date && token) {
            fetchDailyMenu();
        }
    }, [date, token]);

    const fetchDailyMenu = async () => {
        try {
            const response = await axios.get('/ROOT/api/menu/daily/storelist', {
                headers: { Authorization: `Bearer ${token}` },
                params: { date }
            });
            if (response.data && Array.isArray(response.data)) {
                setDailyMenu(response.data);
            } else {
                setErrorMessage("데일리 메뉴를 불러오는 데 실패했습니다.");
            }
        } catch (error) {
            setErrorMessage("데일리 메뉴를 불러오는 중 오류가 발생했습니다.");
        }
    };

    const openModal = (menuItem) => {
        setSelectedMenu(menuItem);
        setNewPrice(menuItem.menuDiscountedPrice);
        setNewQty(menuItem.menuQty);
        setModalVisible(true);
    };

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
                fetchDailyMenu();
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            setErrorMessage("메뉴 수정 중 오류가 발생했습니다.");
        }
    };

    const deleteMenu = async (dailymenuNo) => {
        const confirmDelete = window.confirm("정말로 삭제하시겠습니까?");
        if (!confirmDelete) return;
        try {
            const response = await axios.delete('/ROOT/api/menu/daily/delete', {
                headers: { Authorization: `Bearer ${token}` },
                data: [dailymenuNo]
            });
            if (response.data.status === 200) {
                fetchDailyMenu();
            } else {
                setErrorMessage(response.data.message);
            }
        } catch (error) {
            setErrorMessage("메뉴 삭제 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="daily-menu-container">
            <h2 className="daily-menu-logo">DAILY MENU</h2>
            <p className="daily-menu-p">DAILY MENU 추가 후 오늘의 판매가와 판매수량을 입력해 주세요!</p>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <ul className="daily-menu-list">
                {dailyMenu.map((menuItem) => (
                    <li key={menuItem.dailymenuNo} className="menu-item">
                        <img
                            src={`http://localhost:8080${menuItem.menuImageUrl}`}
                            alt={menuItem.menuName}
                            className="menu-image"
                        />
                        <div className="daily-menu-info">
                            <p className="menu-name">{menuItem.menuName}</p>
                        </div>
                        <div className="daily-menu-info2">
                            <p className="daily-menu-price">원가 : {menuItem.menuPrice} 원</p>
                            <p className="menu-discounted-price">판매가 : {menuItem.menuDiscountedPrice} 원</p>
                            <p className="menu-qty">판매가능수량 : {menuItem.menuQty} 개</p>
                        </div>
                        <div className="menu-actions">
                            <button onClick={() => openModal(menuItem)} className="edit-btn">수정</button>
                            <button onClick={() => deleteMenu(menuItem.dailymenuNo)} className="delete-btn">삭제</button>
                        </div>
                    </li>
                ))}
            </ul>

            {modalVisible && selectedMenu && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>메뉴 수정</h3>
                        <img
                            src={`http://localhost:8080${selectedMenu.menuImageUrl}`}
                            alt={selectedMenu.menuName}
                            className="modal-image"
                        />
                        <p>메뉴 이름: {selectedMenu.menuName}</p>
                        <p>원가: {selectedMenu.menuPrice} 원</p>
                        <label>
                            판매가:
                            <input
                                type="number"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                className="modal-input"
                            />
                        </label>
                        <br />
                        <label>
                            판매가능수량:
                            <input
                                type="number"
                                value={newQty}
                                onChange={(e) => setNewQty(e.target.value)}
                                className="modal-input"
                            />
                        </label>
                        <br />
                        <button onClick={updateMenu} className="modal-btn">수정 완료</button>
                        <button onClick={() => setModalVisible(false)} className="cancel-btn">취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyMenu;
