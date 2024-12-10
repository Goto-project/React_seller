import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../../css/SellerHome.css';
import Menu from './Menu';
import DailyMenu from './DailyMenu';
import OrderList from './OrderList';
import EditInformation from './EditInformation';
import ChangePassword from './ChangePassword';
import TodayOrder from "./TodayOrder";

const SellerHome = ({ onLogout }) => {
  const [activePage, setActivePage] = useState(localStorage.getItem("activePage") || "TODAY_ORDER");
  const [storeInfo, setStoreInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("storeId");
    onLogout();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage("로그인 정보가 유효하지 않습니다.");
      return;
    }

    try {
      const response = await axios.put('/ROOT/api/seller/delete.do', null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.status === 200) {
        navigate("/Thankyou");
      } else {
        setErrorMessage(response.data.message || "회원 탈퇴에 실패했습니다.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storeId = localStorage.getItem('storeId');
    if (!token || !storeId) {
      setErrorMessage("로그인 정보가 유효하지 않습니다.");
      return;
    }

    const fetchStoreDetails = async () => {
      try {
        const response = await axios.get(`/ROOT/api/store/detail/${storeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.status === 200) {
          setStoreInfo(response.data.result); // storeInfo 상태 업데이트
        } else {
          setErrorMessage("가게 정보를 불러오는 데 실패했습니다.");
        }
      } catch (error) {
        setErrorMessage("가게 정보를 불러오는 중 오류가 발생했습니다.");
      }
    };

    fetchStoreDetails();
  }, []);

  // activePage 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("activePage", activePage);
  }, [activePage]);

  //updatedInfo는 EditInformation 컴포넌트에서 수정된 새로운 가게 정보가 담긴 객체
  //setStoreInfo는 useState 훅을 사용하여 설정한 상태 변경 함수
  //setStoreInfo를 호출하면, storeInfo 상태를 새로운 값인 updatedInfo로 갱신
  //setStoreInfo(updatedInfo)는 storeInfo 상태를 updatedInfo로 업데이트하여, 가게 정보가 최신 상태로 반영

  const updateStoreInfo = (updatedInfo) => {
    setStoreInfo(updatedInfo); // EditInformation에서 수정된 정보를 갱신
  };

  const formatStoreId = (storeid) => {
    if (!storeid || storeid.length !== 10) {
      return storeid; // 10자리가 아니면 그대로 반환
    }
    return `${storeid.slice(0, 3)}-${storeid.slice(3, 5)}-${storeid.slice(5)}`;
  };

  const renderContent = () => {
    switch (activePage) {
      case 'TODAY_ORDER':
        return <TodayOrder setActivePage={setActivePage} />;
      case 'MENU':
        return <Menu setActivePage={setActivePage} />;
      case 'DAILY_MENU':
        return <DailyMenu />;
      case 'ORDER_LIST':
        return <OrderList />;
      case 'EDIT_INFORMATION':
        return (
          <EditInformation
            storeInfo={storeInfo}
            setStoreInfo={updateStoreInfo}
          />
        );
      case 'CHANGE_PASSWORD':
        return <ChangePassword />;
      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <h2>ECOEATS</h2>

        {storeInfo ? (
          <div className="store-info">
            {storeInfo.imageurl && (
              <img
                src={`http://localhost:8080${storeInfo.imageurl}`}
                alt="Store"
                className="store-image"
              />
            )}
            <p className="store-name">{storeInfo.storeName}</p>
            <p className="store-address">주소: {storeInfo.address}</p>
            <p className="store-phone">전화번호: {storeInfo.phone}</p>

            <p className="pickup-time">
              픽업시간: {storeInfo.startPickup} - {storeInfo.endPickup}
            </p>

            <p className="store-id">사업자 번호: {formatStoreId(storeInfo.storeid)}</p>

            <div className="infobtn">
              <button className="logoutbutton" onClick={handleLogout}>LOGOUT</button>
              <button
                className="deletebutton"
                onClick={() => setShowModal(true)}
              >
                DELETE ACCOUNT
              </button>
            </div>
          </div>
        ) : (
          <p className="error-message">{errorMessage || "가게 정보를 불러오는 중..."}</p>
        )}

        <ul>
          <li onClick={() => setActivePage('TODAY_ORDER')}>TODAY ORDER</li>
          <li onClick={() => setActivePage('MENU')}>MENU</li>
          <li onClick={() => setActivePage('DAILY_MENU')}>DAILY MENU</li>
          <li onClick={() => setActivePage('ORDER_LIST')}>ORDER LIST</li>
          <li onClick={() => setActivePage('EDIT_INFORMATION')}>EDIT INFORMATION</li>
          <li onClick={() => setActivePage('CHANGE_PASSWORD')}>CHANGE PASSWORD</li>
        </ul>
      </div>

      <div className="main-content">
        {renderContent()}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>정말 탈퇴하시겠습니까?</h3>
            <p>탈퇴 후 정보는 복구할 수 없습니다.</p>
            <div className="modal-buttons">
              <button onClick={handleDeleteAccount} className="confirm-button">
                확인
              </button>
              <button onClick={() => setShowModal(false)} className="cancel-button">
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerHome;
