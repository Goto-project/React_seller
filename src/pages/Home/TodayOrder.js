import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TodayOrder = () => {
    const [orders, setOrders] = useState([]);  // 주문 목록 상태, 빈 배열로 초기화
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState(null);  // 에러 상태

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios.get('/ROOT/api/order/today', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                console.log(response);
                setOrders(response.data || []);  // null 또는 undefined가 들어올 수 있기 때문에 빈 배열로 초기화
                setLoading(false);  // 로딩 상태 업데이트
            })
            .catch((err) => {
                setError('주문 데이터를 가져오는 데 실패했습니다.');
                setLoading(false);  // 로딩 상태 업데이트
            });
    }, []);

    // 주문 취소 핸들러
    const handleCancelOrder = (orderNumber) => {
        const token = localStorage.getItem('token');
        
        const orderDTO = {
            orderNo: orderNumber,
        };

        axios.post('/ROOT/api/order/sellercancel', orderDTO, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (response.data.status === 200) {
                    alert('주문이 성공적으로 취소되었습니다.');
                    setOrders((prevOrders) => prevOrders.filter(order => order.ordernumber !== orderNumber));
                } else {
                    alert(response.data.message || '주문 취소에 실패했습니다.');
                }
            })
            .catch((err) => {
                alert('서버 오류가 발생했습니다.');
            });
    };

    // 픽업 완료 핸들러
    const handlePickupComplete = (orderNumber) => {
        const token = localStorage.getItem('token');

        axios.put('/ROOT/api/order/pickup-complete', { orderNumber }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                alert('픽업 상태가 완료되었습니다.');
                setOrders((prevOrders) => 
                    prevOrders.map(order =>
                        order.ordernumber === orderNumber ? { ...order, pickupstatus: '완료' } : order
                    )
                );
            })
            .catch((err) => {
                alert('픽업 상태 업데이트에 실패했습니다.');
            });
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>오늘의 주문 목록</h1>
            {orders && orders.length === 0 ? (
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
                            <strong>메뉴:</strong> {order.menuname}<br />
                            <strong>픽업 상태:</strong> {order.pickupstatus}<br />
                            
                            {/* 주문 취소 버튼 */}
                            {order.orderstatus !== '취소' && (
                                <button onClick={() => handleCancelOrder(order.ordernumber)}>
                                    주문 취소
                                </button>
                            )}

                            {/* 픽업 완료 버튼 */}
                            {order.pickupstatus !== '완료' && (
                                <button onClick={() => handlePickupComplete(order.ordernumber)}>
                                    픽업 완료
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TodayOrder;