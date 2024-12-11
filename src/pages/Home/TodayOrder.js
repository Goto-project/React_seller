import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../../css/TodayOrder.css';

const TodayOrder = () => {
    const [orders, setOrders] = useState([]);  // 주문 목록 상태, 빈 배열로 초기화
    const [cancelledOrders, setCancelledOrders] = useState([]);  // 취소된 주문 목록 상태
    const [loading, setLoading] = useState(true);  // 로딩 상태
    const [error, setError] = useState(null);  // 에러 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const ordersPerPage = 6; // 한 페이지에 보일 주문 수

    // 총 페이지 수 계산
    const totalPages = Math.ceil(orders.length / ordersPerPage);

    // 현재 페이지에 해당하는 주문 목록 계산
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    // 페이지 변경 함수
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // 오늘의 주문 불러오기
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
                    setError('오늘의 주문이 없습니다.');  // 주문이 없을 경우 메시지 처리
                } else {
                    const sortedOrders = response.data.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime)); // 최신순으로 정렬
                    setOrders(sortedOrders || []);  // 주문 데이터 처리
                    setLoading(false);  // 로딩 상태 업데이트
                }
                setLoading(false);  // 로딩 상태 업데이트
            })
            .catch(() => {
                setError('주문 데이터를 가져오는 데 실패했습니다.');
                setLoading(false);  // 로딩 상태 업데이트
            });
    }, []);

    // 주문 취소 핸들러
    const handleCancelOrder = async (orderNo) => {
        try {
            const token = localStorage.getItem('token');

            // 주문 취소 확인
            const isConfirmed = window.confirm('정말로 이 주문을 취소하시겠습니까?');

            if (isConfirmed) {
                const response = await axios.post('/ROOT/api/order/sellercancel',
                    { orderNo: orderNo },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true
                    }
                );

                // 백엔드 응답 상태 코드에 따른 처리
                if (response.data.status === 200) {
                    // 성공적으로 취소된 경우: 주문 목록에서 해당 주문을 취소 상태로 변경
                    setOrders(prevOrders =>
                        prevOrders.filter(order => order.ordernumber !== orderNo)
                    );
                    // 취소된 주문을 별도로 관리
                    setCancelledOrders(prevCancelledOrders => [
                        ...prevCancelledOrders,
                        { ordernumber: orderNo, orderstatus: '주문 취소' }
                    ]);

                    // 성공 메시지 표시
                    alert(response.data.message || '주문이 성공적으로 취소되었습니다.');
                } else {
                    alert(response.data.message || '주문 취소에 실패했습니다.');
                }
            }
        } catch (err) {
            console.error('주문 취소 중 오류 발생:', err);
            alert('주문 취소 중 오류가 발생했습니다.');
        }
    };


    // 픽업 완료 핸들러
    const handleCompletePickup = async (orderNo) => {
        try {
            const token = localStorage.getItem('token');
            const isConfirmed = window.confirm('픽업 완료 처리하시겠습니까?');

            if (isConfirmed) {
                const response = await axios.put(
                    `/ROOT/api/pickup/update/${orderNo}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.data.status === 200) {
                    // 픽업 상태 업데이트 (필요시 로컬 상태 변경)
                    setOrders((prevOrders) =>
                        prevOrders.map((order) =>
                            order.ordernumber === orderNo
                                ? { ...order, pickupstatus: 1 }
                                : order
                        )
                    );
                    alert(response.data.message || '픽업 성공적으로 완료되었습니다.');
                } else {
                    alert(response.data.message || '픽업 완료 처리에 실패했습니다.');
                }
            }
        } catch (err) {
            console.error("픽업 완료 처리 중 오류 발생:", err);
            alert('픽업 완료 처리 중 오류가 발생했습니다.');
        }
    };



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
            {orders.length === 0 ? (
                <div className="no-orders">오늘의 진행 중인 주문이 없습니다.</div>
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
                            <strong>주문 시간:</strong> {new Date(order.orderTime).toLocaleString('ko-KR')}
                            </div>
                            <div className="order-detail">
                                <strong>고객:</strong> {order.customeremail}
                            </div>
                            <div className="order-detail">
                                <strong>메뉴:</strong> {order.menuname}
                            </div>
                            <div className="order-detail">
                                <strong>픽업 상태:</strong> {order.pickupstatus === 1 ? "완료" : "대기"}
                            </div>
                            {order.orderstatus !== '완료' && order.orderstatus !== '주문 취소' && (
                                <div className="order-cancellation">
                                    <button
                                        onClick={() => handleCancelOrder(order.ordernumber)}
                                        className="cancel-order-btn"
                                    >
                                        주문 취소
                                    </button>
                                    {order.pickupstatus !== '완료' &&
                                        order.orderstatus !== "주문 취소" &&
                                        order.pickupstatus !== 1 && (
                                            <button
                                                onClick={() => handleCompletePickup(order.ordernumber)}
                                                className="complete-pickup-btn"
                                            >
                                                픽업 완료
                                            </button>
                                        )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {/* 취소된 주문 목록 */}
            {cancelledOrders.length > 0 && (
                <div className="cancelled-orders">
                    <h2 className="header">취소된 주문</h2>
                    <ul className="order-list">
                        {cancelledOrders.map((order, index) => (
                            <li key={index} className="order-item">
                                <div className="order-detail">
                                    <strong>주문 번호:</strong> {order.ordernumber}
                                </div>
                                <div className="order-detail">
                                    <strong>주문 상태:</strong> {order.orderstatus}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TodayOrder;
