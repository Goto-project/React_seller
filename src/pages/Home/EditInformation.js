import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import axios from 'axios';
import '../../css/EditInfo.css';

const EditInformation = ({ storeInfo, setStoreInfo }) => {
    const [storeInfoState, setStoreInfoState] = useState({
        storeName: '',
        address: '',
        phone: '',
        category: '',
        startPickup: '',
        endPickup: '',
        imageurl: '',
        storeid: '',
        storeemail: '',
    });
    
    
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const { storeId, token } = location.state || {};
    const [preview, setPreview] = useState(null);

    const [editCheck, seteditCheck] = useState(false);

    useEffect(() => {
        if (!storeId || !token) {
            setErrorMessage('유효한 storeId와 token이 전달되지 않았습니다.');
            setIsLoading(false);
            return;
        }

        const fetchStoreDetails = async () => {
            try {
                const url = `/ROOT/api/store/detail/${storeId}`;
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.status === 200) {
                    const storeDetails = response.data.result;
                    setStoreInfo(storeDetails);
                    setPreview(storeDetails.imageUrl);
                } else {
                    setErrorMessage('가게 정보를 불러오는 데 실패했습니다.');
                }
            } catch (error) {
                setErrorMessage('가게 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStoreDetails();
    }, [storeId, token, editCheck]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStoreInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile)); // 새 파일 미리보기
        } else {
            setPreview(storeInfo.imageurl); // 파일이 없으면 기존 이미지 유지
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("storeInfo:", JSON.stringify(storeInfo, null, 2));

        const formData = new FormData();
        formData.append('store', new Blob([JSON.stringify(storeInfo)], { type: 'application/json' }));
        if (file) {
            formData.append('file', file); // 새 파일이 있으면 추가
        }

        try {
            const response = await axios.put('/ROOT/api/seller/update.do', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.status === 200) {
                alert('가게 정보가 성공적으로 수정되었습니다.');
                seteditCheck((prev) => (!prev));
                setStoreInfo(storeInfoState);
            } else {
                setMessage(response.data.message || '가게 정보 수정에 실패했습니다.');
            }
            console.log("Submitting storeInfo:", storeInfo);
        } catch (error) {
            console.error('Error updating store info:', error);
            setMessage('가게 정보 수정 중 오류가 발생했습니다.');
        }
    };

    if (isLoading) {
        return <p>로딩 중...</p>;
    }

    const formatStoreId = (storeid) => {
        if (!storeid || storeid.length !== 10) {
            return storeid; // 10자리가 아니면 그대로 반환
        }
        return `${storeid.slice(0, 3)}-${storeid.slice(3, 5)}-${storeid.slice(5)}`;
    };

    return (
        <div className="store-editcontainer">
            <h1 className="store-edit-title">EDIT STORE INFORMATION</h1>

            <form onSubmit={handleSubmit}> {/* form 태그로 변경 */}

                <div className="input-group">
                    <label>사업자 번호:</label>
                    <input
                        type="text"
                        value={formatStoreId(storeInfo.storeid)}
                        disabled // 변경 불가능
                        className="editstoreId"
                    />
                </div>
                <div className="input-group">
                    <label>가게 이메일:</label>
                    <input
                        type="email"
                        value={storeInfo.storeemail}
                        disabled // 변경 불가능
                        className="editstoreEmail"
                    />
                </div>

                <div className="sellereditinput">
                    <div className="input-group">
                        <label>가게 이름:</label>
                        <input
                            type="text"
                            name="storeName"
                            value={storeInfo.storeName}
                            onChange={handleChange}
                            className="editstoreName"
                        />
                    </div>
                    <div className="input-group">
                        <label>가게 주소:</label>
                        <input
                            type="text"
                            name="address"
                            value={storeInfo.address}
                            onChange={handleChange}
                            className="editstoreAddress"
                        />
                    </div>
                    <div className="input-group">
                        <label>전화번호:</label>
                        <input
                            type="text"
                            name="phone"
                            value={storeInfo.phone}
                            onChange={handleChange}
                            className="editstorePhone"
                        />
                    </div>
                </div>

                <div className="option-input">
                    <div className="input-group">
                        <label>카테고리:</label>
                        <select
                            name="category"
                            value={storeInfo.category}
                            className="editselect"
                            onChange={handleChange} // 카테고리 변경 핸들러 추가
                        >
                            <option value="">Select Category</option>
                            <option value="베이커리">베이커리</option>
                            <option value="도시락">도시락</option>
                            <option value="편의점">편의점</option>
                            <option value="기타">기타</option>
                        </select>
                    </div>
                </div>

                <div className="time-selection">
                    <div className="input-group">
                        <label>픽업 시작 시간:</label>
                        <select
                            name="startPickup"
                            value={storeInfo.startPickup}
                            className="editstartPickup"
                            onChange={handleChange} // 핸들러 추가
                        >
                            <option value=""></option>
                            {[...Array(24)].map((_, hour) => {
                                return [0, 15, 30, 45].map((minute) => {
                                    const time = `${hour.toString().padStart(2, '0')}:${minute
                                        .toString()
                                        .padStart(2, '0')}`;
                                    return (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    );
                                });
                            })}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>픽업 종료 시간:</label>
                        <select
                            name="endPickup"
                            value={storeInfo.endPickup}
                            className="editendPickup"
                            onChange={handleChange} // 핸들러 추가
                        >
                            <option value=""></option>
                            {[...Array(24)].map((_, hour) => {
                                return [0, 15, 30, 45].map((minute) => {
                                    const time = `${hour.toString().padStart(2, '0')}:${minute
                                        .toString()
                                        .padStart(2, '0')}`;
                                    return (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    );
                                });
                            })}
                        </select>
                    </div>
                </div>

                <div className='store-image-input'>
                    <label className="store-image-label">현재 가게 이미지</label>
                    <div className="store-image-container">
                        {storeInfo.imageurl && (
                            <img
                                src={`http://localhost:8080${storeInfo.imageurl}`}
                                alt="기존 이미지"
                                className="store-image-current"
                            />
                        )}
                    </div>
                </div>

                <div className="image-upload-input">
                    <label className="store-newimage-label">새로운 가게 이미지</label>
                    <input type="file" onChange={handleFileChange} />
                </div>
                <div className="image-upload-container">
                    {preview && (
                        <div className="store-image-preview">
                            <img
                                src={preview}
                                alt="미리보기"
                            />
                        </div>
                    )}
                </div>

                <button type="submit" className='editinfobtn'>저장</button>
            </form>
        </div>
    );
};

export default EditInformation;
