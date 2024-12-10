import React, { useState, useEffect } from "react";
import Calendar from "react-calendar"; // 달력 라이브러리 사용
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import '../../css/OrderList.css';

const OrderList = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [groupedOrders, setGroupedOrders] = useState([]);
    const [expandedOrders, setExpandedOrders] = useState({});
    const [dailyTotal, setDailyTotal] = useState(0);
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [calendarData, setCalendarData] = useState({});
    const [message, setMessage] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // 페이지 상태 추가
    const ordersPerPage = 5; // 한 페이지에 보여줄 주문 개수

    const formatDate = (date) => {
        setSelectedDate(date);
    };

    const onDateChange = (date) => {
        formatDate(date);
        console.log("onDateChange", date);
    };

    const onActiveStartDateChange = ({ activeStartDate }) => {
        formatDate(activeStartDate);
        fetchMonthlySales(activeStartDate); // 달 이동 시 새로운 월 매출 데이터를 가져옴
        console.log("onActiveStartDateChange", activeStartDate);
    };

    useEffect(() => {
        fetchDailyOrders(selectedDate);
        fetchMonthlySales(selectedDate); // 초기 월 매출 데이터 로드
    }, [selectedDate]);

    // 특정 날짜의 주문 내역 가져오기
    const fetchDailyOrders = async (date) => {
        try {
            const formattedDate = date.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            }).replace(/\. /g, "-").replace(".", "");

            const token = localStorage.getItem("token");
            const response = await axios.get(`/ROOT/api/orderview/datestore`, {
                params: { date: formattedDate },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.status === 200 && Array.isArray(response.data.orders)) {
                const orders = response.data.orders;
                const grouped = orders.reduce((acc, order) => {
                    const { ordernumber, totalprice, orderstatus, menuname, quantity, unitprice } = order;
                    if (!acc[ordernumber]) {
                        acc[ordernumber] = {
                            ordernumber,
                            totalprice,
                            orderstatus,
                            items: [],
                        };
                    }
                    acc[ordernumber].items.push({ menuname, quantity, unitprice });
                    return acc;
                }, {});

                const totalDailyPrice = Object.values(grouped).reduce((total, order) => {
                    return order.orderstatus === "주문 완료" ? total + order.totalprice : total;
                }, 0);
                setGroupedOrders(Object.values(grouped));
                setDailyTotal(totalDailyPrice);
                setMessage(''); // 주문 내역이 있을 경우 메시지 초기화
            } else {
                setGroupedOrders([]);
                setDailyTotal(0);
                setMessage('주문 내역이 없습니다.');
            }
        } catch (error) {
            console.error("데이터 가져오기 실패", error);
            setGroupedOrders([]);
            setDailyTotal(0);
            setMessage('주문 내역을 가져오는 중 오류가 발생했습니다.');
        }
    };

    // 월 매출 데이터 가져오기
    const fetchMonthlySales = async (date) => {
        const formattedMonth = date.toISOString().slice(0, 7); // yyyy-MM 형식
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`/ROOT/api/orderview/monthlySales`, {
                params: { month: formattedMonth },
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.status === 200) {
                const { dailySales, totalMonthlySales } = response.data;
                setCalendarData(dailySales); // 날짜별 매출 데이터 저장
                setMonthlyTotal(totalMonthlySales); // 월 매출 합계 저장
            } else {
                setCalendarData({});
                setMonthlyTotal(0);
            }
        } catch (error) {
            console.error("월 매출 데이터 가져오기 실패", error);
            setCalendarData({});
            setMonthlyTotal(0);
        }
    };

    const toggleExpand = (ordernumber) => {
        setExpandedOrders((prevState) => ({
            ...prevState,
            [ordernumber]: !prevState[ordernumber],
        }));
    };

    const formatPrice = (price) => price.toLocaleString();

    // 현재 페이지에 맞는 주문 목록을 반환
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = groupedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    // 페이지 번호 변경 함수
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // 페이지 번호 생성 함수
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(groupedOrders.length / ordersPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="order-list-container">
            <h1 className="order-list-title">📋 ORDER LIST</h1>
            <h2 className="monthly-total">
                {selectedDate.toLocaleString("default", { month: "long" })} 총 매출 : {formatPrice(monthlyTotal)}원
            </h2>
            <div className="calendar-wrapper">
                <h3 className="calendar-title">📊 월 매출 달력</h3>
                <Calendar
                    onChange={onDateChange}
                    value={selectedDate}
                    onActiveStartDateChange={onActiveStartDateChange}
                    tileContent={({ date, view }) => {
                        const formattedDate = date
                            .toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })
                            .replace(/\. /g, "-")
                            .replace(".", ""); // yyyy-MM-dd

                        const sales = calendarData[formattedDate];
                        if (view === "month" && sales) {
                            return <div className="calendar-tile-content">{formatPrice(sales)}원</div>;
                        }
                        return null;
                    }}
                />
            </div>
            <h2 className="daily-total">📌 오늘의 매출 : {formatPrice(dailyTotal)}원</h2>
            {message && <p className="no-orders-message">{message}</p>}
            <ul className="order-list">
                {currentOrders.map((order) => (
                    <li key={order.ordernumber} className="order-item">
                        <div className="order-header">
                            <span>🆔 주문번호: {order.ordernumber}</span>
                            <span>💰 총액: {formatPrice(order.totalprice)}원</span>
                            <span>📦 상태: {order.orderstatus}</span>
                            <button
                                className="toggle-button"
                                onClick={() => toggleExpand(order.ordernumber)}
                            >
                                {expandedOrders[order.ordernumber] ? "▲  간략히 보기" : "▼  자세히 보기"}
                            </button>
                        </div>
                        {expandedOrders[order.ordernumber] && (
                            <ul className="order-details">
                                <p style={{ fontSize: '15px', marginBottom: '10px' }}>📋 [주문내역]</p>
                                {order.items.map((item, index) => (
                                    <li key={index} className="order-detail-item">
                                        <div className="menu-quantity">
                                            <p>{item.menuname}</p>
                                            <span className="item-quantity">x {item.quantity}개</span>
                                        </div>
                                        <span className="item-price">{formatPrice(item.unitprice)}원</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                    </li>
                ))}
            </ul>

            {/* 페이지네이션 */}
            <div className="pagination">
                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        className={`page-button ${currentPage === number ? "active" : ""}`}
                        onClick={() => paginate(number)}
                    >
                        {number}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OrderList;
