import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const DailyMenu = () => {
    const [dailyMenu, setDailyMenu] = useState([]);
    const [date, setDate] = useState(""); // 메뉴를 조회할 날짜
    const [errorMessage, setErrorMessage] = useState("");
    const location = useLocation();
    const { storeId, token } = location.state || {};

    useEffect(() => {
        if (!date) {
            // 현재 날짜로 자동 설정
            const today = new Date();
            const currentDate = today.toISOString().split('T')[0]; // yyyy-MM-dd 형식
            setDate(currentDate); // 날짜를 상태에 저장
        }
    }, [date]);  // date 값이 변경될 때만 실행되도록 설정

    useEffect(() => {
        if (date) {
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

            console.log(response); // 서버 응답 확인
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
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DailyMenu;
