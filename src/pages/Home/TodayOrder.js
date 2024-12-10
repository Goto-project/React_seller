import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../css/TodayOrder.css';

const TodayOrder = () => {
    const [orders, setOrders] = useState([]);  // 주문 목록 상태, 빈 배열로 초기화
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

    // 주문 취소 핸들러
    const handleCancelOrder = async (orderNo) => {
        try {
            const token = localStorage.getItem('token');

            // 주문 취소 확인
            const isConfirmed = window.confirm('정말로 이 주문을 취소하시겠습니까?');

            if (isConfirmed) {
                const response = await axios.post('/ROOT/api/order/sellercancel',
                    { orderNo: orderNo },  // orderDTO에 해당하는 객체
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        withCredentials: true  // 크리덴셜 허용
                    }
                );

                // 백엔드 응답 상태 코드에 따른 처리
                if (response.data.status === 200) {
                    // 성공적으로 취소된 경우: 로컬 상태에서 주문 제거
                    setOrders(prevOrders =>
                        prevOrders.filter(order => order.ordernumber !== orderNo)
                    );

                    // 성공 메시지 표시
                    alert(response.data.message || '주문이 성공적으로 취소되었습니다.');
                } else {
                    // 실패한 경우: 백엔드에서 전달된 메시지 표시
                    alert(response.data.message || '주문 취소에 실패했습니다.');
                }
            }
        } catch (err) {
            console.error('주문 취소 중 오류 발생:', err);
            // 더 상세한 에러 핸들링
            if (err.response) {
                // 서버 응답이 있는 경우
                switch (err.response.status) {
                    case 403:
                        alert('접근 권한이 없습니다. 다시 로그인해주세요.');
                        break;
                    case 404:
                        alert('주문을 찾을 수 없습니다.');
                        break;
                    case 500:
                        alert('서버 내부 오류가 발생했습니다.');
                        break;
                    default:
                        alert('주문 취소 중 오류가 발생했습니다.');
                }
            } else if (err.request) {
                // 요청은 보내졌으나 응답을 받지 못한 경우
                alert('서버와 통신 중 문제가 발생했습니다.');
            } else {
                // 그 외 일반적인 오류
                alert('예상치 못한 오류가 발생했습니다.');
            }
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
            <h1 className="header">📋 오늘의 주문 목록</h1>
            {/* 주문이 없을 경우 메시지 표시 */}
            {orders.length === 0 ? (
                <div className="no-orders">오늘의 주문이 없습니다.</div>
            ) : (
                <>
                    <ul className="today-order-list">
                        {currentOrders.map((order, index) => (
                            <li key={index} className="today-order-item">
                                <div className="order-section">
                                    {/* 첫 번째 칸: 주문번호, 주문시간 */}
                                    <div className="order-detail">
                                        <strong>주문 번호:</strong> {order.ordernumber}
                                    </div>
                                    <div className="order-detail">
                                        <strong>주문 시간:</strong> {order.orderTime}
                                    </div>
                                </div>
    
                                <div className="order-section">
                                    {/* 두 번째 칸: 메뉴, 가격 */}
                                    <div className="order-detail">
                                        <strong>메뉴:</strong> {order.menuname}
                                    </div>
                                    <div className="order-detail">
                                        <strong>총 금액:</strong> {order.totalprice} 원
                                    </div>
                                </div>
    
                                <div className="order-section">
                                    {/* 세 번째 칸: 고객, 주문 상태, 픽업 상태 */}
                                    <div className="order-detail">
                                        <strong>고객:</strong> {order.customeremail}
                                    </div>
                                    <div className="order-detail">
                                        <strong>주문 상태:</strong> {order.orderstatus}
                                    </div>
                                    <div className="order-detail">
                                        <strong>픽업 상태:</strong> {order.pickupstatus === 1 ? "완료" : "대기"}
                                    </div>
                                </div>
    
                                {/* 취소 및 픽업 완료 버튼 */}
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
    
                    {/* 페이지네이션 버튼 */}
                    <div className="pagination">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            이전
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => paginate(index + 1)}
                                className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            다음
                        </button>
                    </div>
                </>
            )}
        </div>
    );
    
    
};

export default TodayOrder;
