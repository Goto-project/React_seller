import axios from 'axios';
import React, { useEffect, useState } from 'react';
import '../../css/TodayOrder.css';

const TodayOrder = () => {
    const [orders, setOrders] = useState([]);
    const [cancelledOrders, setCancelledOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 5;

    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get('/ROOT/api/order/today', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                if (response.data && response.data[0] && response.data[0].status === 404) {
                    setError('오늘의 주문이 없습니다.');
                } else {
                    const sortedOrders = response.data.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
                    setOrders(sortedOrders || []);
                    setLoading(false);
                }
                setLoading(false);
            })
            .catch(() => {
                setError('주문 데이터를 가져오는 데 실패했습니다.');
                setLoading(false);
            });
    }, []);

    const handleCancelOrder = async (orderNo) => {
        try {
            const token = localStorage.getItem('token');
            const isConfirmed = window.confirm('정말로 이 주문을 취소하시겠습니까?');
            if (isConfirmed) {
                const response = await axios.post('/ROOT/api/order/sellercancel', { orderNo: orderNo }, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    withCredentials: true,
                });
                if (response.data.status === 200) {
                    setOrders(prevOrders => prevOrders.filter(order => order.ordernumber !== orderNo));
                    setCancelledOrders(prevCancelledOrders => [...prevCancelledOrders, { ordernumber: orderNo, orderstatus: '주문 취소' }]);
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

    const handleCompletePickup = async (orderNo) => {
        try {
            const token = localStorage.getItem('token');
            const isConfirmed = window.confirm('픽업 완료 처리하시겠습니까?');
            if (isConfirmed) {
                const response = await axios.put(`/ROOT/api/pickup/update/${orderNo}`, {}, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.data.status === 200) {
                    setOrders((prevOrders) =>
                        prevOrders.map((order) =>
                            order.ordernumber === orderNo ? { ...order, pickupstatus: 1 } : order
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
            <h1 className="header">TODAY'S ORDER LIST</h1>
            {orders.length === 0 ? (
                <div className="no-orders">오늘의 진행 중인 주문이 없습니다.</div>
            ) : (
                <ul className="order-list">
                    {currentOrders.map((order, index) => (
                        <li key={index} className="order-card">
                            <div className="order-info">
                                <div className="order-detail"><strong>주문 번호:</strong> {order.ordernumber}</div>
                                <div className="order-detail"><strong>주문 상태:</strong> {order.orderstatus}</div>
                                <div className="order-detail"><strong>주문 시간:</strong> {new Date(order.orderTime).toLocaleString('ko-KR')}</div>
                                <div className="order-detail"><strong>고객:</strong> {order.customeremail}</div>
                                <div className='today-order-menu'>
                                    <div className="order-detail"><strong>메뉴:</strong> {order.menuname}</div>
                                    <div className="order-detail"><strong>총 금액:</strong> {order.totalprice} 원</div>
                                    <div className="order-detail"><strong>픽업 상태:</strong> {order.pickupstatus === 1 ? "완료" : "대기"}</div>
                                </div>
                            </div>
                            <div className="order-actions">
                                {order.orderstatus !== '완료' && order.orderstatus !== '주문 취소' && (
                                    <button onClick={() => handleCancelOrder(order.ordernumber)} className="cancel-order-btn">주문 취소</button>
                                )}
                                {order.pickupstatus !== 1 && order.orderstatus !== "주문 취소" && (
                                    <button onClick={() => handleCompletePickup(order.ordernumber)} className="complete-pickup-btn">픽업 완료</button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                        onClick={() => paginate(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
            {cancelledOrders.length > 0 && (
                <div className="cancelled-orders">
                    <h2 className="header">취소된 주문</h2>
                    <ul className="order-list">
                        {cancelledOrders.map((order, index) => (
                            <li key={index} className="order-item">
                                <div className="order-detail"><strong>주문 번호:</strong> {order.ordernumber}</div>
                                <div className="order-detail"><strong>주문 상태:</strong> {order.orderstatus}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TodayOrder;
