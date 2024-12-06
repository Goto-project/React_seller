import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {

    const [storeId, setStoreId] = useState(""); // 사업자 번호
    const [storeEmail, setStoreEmail] = useState(""); // 이메일
    const [newPwd, setNewPwd] = useState("");
    const [confirmNewPwd, setConfirmNewPwd] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleChangePassword = async () => {
        if (!storeId || !storeEmail || !newPwd || !confirmNewPwd) {
            setMessage("모든 필드를 입력해주세요.");
            return;
        }

        if (newPwd !== confirmNewPwd) {
            setMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            // API 호출
            const response = await axios.put('ROOT/api/seller/forgotpassword.do', null, {
                params: {
                    storeId: storeId,
                    storeEmail: storeEmail,
                    newPwd: newPwd,
                },
            });

            // 응답 처리
            if (response.data.status === 200) {
                alert("비밀번호가 재설정되었습니다.");
                navigate('/');
            } else {
                setMessage(response.data.message);
            }
        } catch (error) {
            console.error("비밀번호 변경 오류:", error);
            setMessage("서버 오류가 발생했습니다.");
        }
    };

    return (

        <div className="password-edit-container">

            <div className="password-edit-back">
                <h2 className="password-edit-title">비밀번호 변경</h2>
                <div className="passwordeditinput">
                    <div className="password-input-group">
                        <label htmlFor="storeId">사업자 번호</label>
                        <input
                            type="text"
                            id="storeId"
                            value={storeId}
                            onChange={(e) => setStoreId(e.target.value)}
                            placeholder="사업자 번호 입력"
                        />
                    </div>
                    <div className="password-input-group">
                        <label htmlFor="storeEmail">이메일</label>
                        <input
                            type="email"
                            id="storeEmail"
                            value={storeEmail}
                            onChange={(e) => setStoreEmail(e.target.value)}
                            placeholder="이메일 입력"
                        />
                    </div>
                    <div className="password-input-group">
                        <label htmlFor="newPwd">새 비밀번호</label>
                        <input
                            type="password"
                            id="newPwd"
                            value={newPwd}
                            onChange={(e) => setNewPwd(e.target.value)}
                            placeholder="새 비밀번호 입력"
                        />
                    </div>
                    <div className="password-input-group">
                        <label htmlFor="confirmNewPwd">새 비밀번호 확인</label>
                        <input
                            type="password"
                            id="confirmNewPwd"
                            value={confirmNewPwd}
                            onChange={(e) => setConfirmNewPwd(e.target.value)}
                            placeholder="새 비밀번호 확인"
                        />
                    </div>
                </div>
                <button className="editpasswordbtn" onClick={handleChangePassword}>
                    비밀번호 변경
                </button>
                {message && <div className="message-container">{message}</div>}
            </div>

            <br />
            <div className="home-container">
                <Link to="/" className="link">로그인 페이지로 이동</Link>
            </div>
        </div>
    );
};

export default ForgotPassword;