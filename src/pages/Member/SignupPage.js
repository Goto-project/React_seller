import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // useNavigate 훅 임포트
import '../../css/SignupPage.css';

function SignupPage() {
    const [member, setMember] = useState({
        storeId: '',
        storeEmail: '',
        password: '',
        storeName: '',
        address: '',
        phone: '',
        category: '',
        startPickup: '',
        endPickup: '',
        storeImage: null,  // 이미지 상태 추가
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setMember((prevMember) => ({
            ...prevMember,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const { files } = e.target;
        if (files.length > 0) {
            setMember((prevMember) => ({
                ...prevMember,
                storeImage: files[0],
            }));
        }
    };

    const handleJoin = async () => {
        const storeIdRegex = /^\d{10}$/;
        if (!storeIdRegex.test(member.storeId)) {
            alert('사업자 번호는 10자리 숫자만 입력할 수 있습니다.');
            return;
        }
        const url = `/ROOT/api/seller/join.do`;
        const headers = {"Content-Type":"multipart/form-data"};
        const formData = new FormData();
    
        const data1 = {
            storeId: member.storeId,
            storeEmail: member.storeEmail,
            password: member.password,
            storeName: member.storeName,
            address: member.address,
            phone: member.phone,
            category: member.category,
            startPickup: member.startPickup,
            endPickup: member.endPickup,
        };

        formData.append("store", new Blob([JSON.stringify(data1)], {
            type: "application/json"
        }));

        if (member.storeImage) {
            formData.append("file", member.storeImage);
        }
    
        try {
            const { data } = await axios.post(url, formData, {headers});
            if (data.status === 200) {
                alert('회원가입 성공');
                navigate('/');
            } else {
                alert('회원가입 실패');
            }
        } catch (error) {
            console.error('Error during sign-up:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="signup-page">
            <div className='signup-logo-container'>
                <h2 className='signup-logo'>ECOEATS</h2>
            </div>

            <div className='signup-container'>
                <h3 className='signup-title'>SELLER SIGN UP</h3>
                <div className='signup-input'>
                    <input
                        type='text'
                        placeholder='사업자 번호를 입력하세요 (숫자 10자리만 입력)'
                        name="storeId"
                        className='storeId'
                        value={member.storeId}
                        onChange={handleChange}
                    />
                    <input
                        type="email"
                        placeholder="EMAIL"
                        name="storeEmail"
                        className='storeEmail'
                        value={member.storeEmail}
                        onChange={handleChange}
                    />
                    <input
                        type="password"
                        placeholder="PASSWORD"
                        name="password"
                        className='password'
                        value={member.password}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        placeholder="STORE NAME"
                        name="storeName"
                        className='storeName'
                        value={member.storeName}
                        onChange={handleChange}
                    />
                    <input
                        type='text'
                        placeholder='STORE ADDRESS'
                        name="address"
                        className='Address'
                        value={member.address}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        placeholder="PHONE"
                        name="phone"
                        className='phone'
                        value={member.phone}
                        onChange={handleChange}
                    />

                    {/* 가게 이미지 첨부 부분 추가 */}
                    <div className="image-upload">
                        <label htmlFor="storeImage" className="image-label">가게 이미지 첨부</label>
                        <input
                            type="file"
                            name="storeImage"
                            id="storeImage"
                            className="storeImage"
                            onChange={handleImageChange}
                        />
                    </div>
                </div>

                <div className='sign-up-option-input'>
                    <select
                        className='select'
                        name="category"
                        value={member.category}
                        onChange={handleChange}
                    >
                        <option value="">Select Category</option>
                        <option value="베이커리">베이커리</option>
                        <option value="도시락">도시락</option>
                        <option value="편의점">편의점</option>
                        <option value="기타">기타</option>
                    </select>
                </div>

                <div className="sign-up-time-selection">
                    <p>PICKUP TIME</p>
                        <select name="startPickup" className='startPickup' value={member.startPickup} onChange={handleChange}>
                            <option value="">Select Start Time</option>
                            {[...Array(24)].map((_, hour) => (
                                [0, 15, 30, 45].map((minute) => {
                                    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                    return <option key={time} value={time}>{time}</option>;
                                })
                            ))}
                        </select>

                        <select name="endPickup" className='endPickup' value={member.endPickup} onChange={handleChange}>
                            <option value="">Select End Time</option>
                            {[...Array(24)].map((_, hour) => (
                                [0, 15, 30, 45].map((minute) => {
                                    const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                    return <option key={time} value={time}>{time}</option>;
                                })
                            ))}
                        </select>
                    </div>

                <button className='signup-button' onClick={handleJoin}>COMPLETE</button>
            </div>
        </div>
    );
}

export default SignupPage;
