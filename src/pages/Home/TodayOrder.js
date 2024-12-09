import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/TodayOrder.css';

const TodayOrder = () => {
    const [orders, setOrders] = useState([]);  // 주문 목록 상태, 빈 배열로 초기화
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState(null);  // 에러 상태

    useEffect(() => {
        // Bearer 토큰을 사용할 경우, 예시로 로컬 스토리지에서 가져올 수 있음
        const token = localStorage.getItem('token');

        // API 호출
        axios.get('/ROOT/api/order/today', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            console.log(response)
            setOrders(response.data || []);  // null 또는 undefined가 들어올 수 있기 때문에 빈 배열로 초기화
            setLoading(false);  // 로딩 상태 업데이트
        })
        .catch((err) => {
            setError('주문 데이터를 가져오는 데 실패했습니다.');
            setLoading(false);  // 로딩 상태 업데이트
        });
    }, []);

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>오늘의 주문 목록</h1>
            {orders.length === 0 ? (
                <div>오늘의 주문이 없습니다.</div>
            ) : (
                <ul>
                    {orders.map((order, index) => (
                        <li key={index}>
                            <strong>주문 번호:</strong> {order.ordernumber}<br />
                            <strong>주문 상태:</strong> {order.orderstatus}<br />
                            <strong>총 금액:</strong> {order.totalprice} 원<br />
                            <strong>주문 시간:</strong> {order.orderTime}<br />
                            <strong>고객:</strong> {order.customeremail}<br />
                            <strong>고객:</strong> {order.menuname}<br />
                            <strong>픽업 상태:</strong> {order.pickupstatus}<br />
                            {/* 필요한 필드 더 추가 */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TodayOrder;