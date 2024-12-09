import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/TodayOrder.css';

const TodayOrder = () => {
    const [orders, setOrders] = useState([]);  // 주문 목록 상태, 빈 배열로 초기화
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState(null);  // 에러 상태
    const [noOrdersMessage, setNoOrdersMessage] = useState("");  // 주문이 없을 경우 메시지 상태

    useEffect(() => {
        const token = localStorage.getItem('token');

        // API 호출
        axios.get('/ROOT/api/order/today', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.data && response.data[0] && response.data[0].status === 404) {
                    setError(response.data[0].message);  // 주문이 없을 경우 메시지 처리
                    setLoading(false);  // 로딩 상태 업데이트
                } else {
                    setOrders(response.data || []);  // 주문 데이터 처리
                    setLoading(false);  // 로딩 상태 업데이트
                }
            })
            .catch((err) => {
                setError('주문 데이터를 가져오는 데 실패했습니다.');
                setLoading(false);  // 로딩 상태 업데이트
            });
    }, []);

    if (loading) {
        return <div className="loading">로딩 중...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="today-order-container">
            <h1 className="header">오늘의 주문 목록</h1>
            {/* 주문이 없을 경우 메시지 표시 */}
            {noOrdersMessage ? (
                <div className="no-orders">{noOrdersMessage}</div>
            ) : (
                <ul className="order-list">
                    {orders.map((order, index) => (
                        <li key={index} className="order-item">
                            <div className="order-detail">
                                <strong>주문 번호:</strong> {order.ordernumber}
                            </div>
                            <div className="order-detail">
                                <strong>주문 상태:</strong> {order.orderstatus}
                            </div>
                            <div className="order-detail">
                                <strong>총 금액:</strong> {order.totalprice} 원
                            </div>
                            <div className="order-detail">
                                <strong>주문 시간:</strong> {order.orderTime}
                            </div>
                            <div className="order-detail">
                                <strong>고객:</strong> {order.customeremail}
                            </div>
                            <div className="order-detail">
                                <strong>메뉴:</strong> {order.menuname}
                            </div>
                            <div className="order-detail">
                                <strong>픽업 상태:</strong> {order.pickupstatus}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TodayOrder;
