import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import VoiceRecorder from '../components/VoiceRecorder';
import { toast } from 'react-toastify';
import { submitReport } from '../api/whistleblower';
import * as Yup from 'yup';

const schema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    criticality: Yup.number().min(1).max(5).required('Criticality is required')
});

const ReportSubmissionPage = () => {
    const history = useHistory();
    const [formData, setFormData] = useState({
        title: '', description: '', department: '', location: '', monetaryValue: '',
        relationship: '', encounter: '', authoritiesAware: false, criticality: 1,
        rewardWallet: ''
    });
    const [voiceNote, setVoiceNote] = useState(null);
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(Date.now());

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setErrors({});

        try {
            await schema.validate(formData, { abortEarly: false });
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (voiceNote) data.append('voiceNote', voiceNote);
            // files.forEach(file => data.append('files', file)); // Disabled until backend supports attachments

            await submitReport(data);
            toast.success('Report submitted successfully');
            setFormData({
                title: '', description: '', department: '', location: '', monetaryValue: '',
                relationship: '', encounter: '', authoritiesAware: false, criticality: 1,
                rewardWallet: ''
            });
            setVoiceNote(null);
            setFiles([]);
            setFileInputKey(Date.now());
            history.push('/reports');
        } catch (err) {
            if (err.name === 'ValidationError') {
                const validationErrors = {};
                err.inner.forEach(e => validationErrors[e.path] = e.message);
                setErrors(validationErrors);
            } else {
                toast.error(err.message || 'Failed to submit report');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Submit Report</h1>
            <form onSubmit={handleSubmit} onKeyPress={handleKeyPress}>
                <div className="mb-4">
                    <label className="block text-gray-700">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        disabled={loading}
                    />
                    {errors.title && <p className="text-red-500">{errors.title}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        onKeyDown={handleKeyPress}
                        className="w-full p-2 border rounded"
                        rows="5"
                        disabled={loading}
                    />
                    {errors.description && <p className="text-red-500">{errors.description}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Criticality (1-5)</label>
                    <input
                        type="number"
                        name="criticality"
                        value={formData.criticality}
                        onChange={handleChange}
                        min="1"
                        max="5"
                        className="w-full p-2 border rounded"
                        disabled={loading}
                    />
                    {errors.criticality && <p className="text-red-500">{errors.criticality}</p>}
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Reward Wallet (optional)</label>
                    <input
                        type="text"
                        name="rewardWallet"
                        value={formData.rewardWallet}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        disabled={loading}
                    />
                </div>
                {/* 
                <div className="mb-4">
                    <label className="block text-gray-700">Attachments</label>
                    <input
                        type="file"
                        name="files"
                        multiple
                        key={fileInputKey}
                        onChange={handleFileChange}
                        className="w-full p-2 border rounded"
                        disabled={loading}
                    />
                    <p className="text-gray-500 text-sm">File attachments not yet supported by backend</p>
                </div>
                */}
                <VoiceRecorder onVoiceNote={(file) => setVoiceNote(file)} />
                <button 
                    type="submit" 
                    className="bg-blue-500 text-white p-2 rounded"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
};

export default ReportSubmissionPage;