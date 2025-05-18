import React, { useState, useRef } from 'react';
import { FaPause, FaPlay, FaStop, FaMicrophone, FaTrash, FaFileUpload, FaTimesCircle, FaInfoCircle, FaMicrophoneAlt } from 'react-icons/fa';
import { useForm, useFieldArray } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { submitReport } from '../api/whistleblower';
import VoiceRecorder from './VoiceRecorder';

// Form validation schema
const reportSchema = yup.object().shape({
  title: yup.string().when(['hasVoiceNote', 'hasAttachments'], {
    is: (hasVoiceNote, hasAttachments) => !hasVoiceNote && !hasAttachments,
    then: () => yup.string().required('Title is required when no voice note or attachments are provided'),
    otherwise: () => yup.string().notRequired(),
  }),
  description: yup.string().when(['hasVoiceNote', 'hasAttachments'], {
    is: (hasVoiceNote, hasAttachments) => !hasVoiceNote && !hasAttachments,
    then: () => yup.string().required('Description is required when no voice note or attachments are provided'),
    otherwise: () => yup.string().notRequired(),
  }),
  submitter: yup.string(),
  email: yup.string().email('Invalid email').optional(),
  phone: yup.string().optional(),
  criticality: yup.number().min(1).max(5).required('Criticality is required'),
  rewardWallet: yup.string(),
  department: yup.string(),
  location: yup.string(),
  monetaryValue: yup.string(),
  relationship: yup.string(),
  encounter: yup.string(),
  authoritiesAware: yup.boolean().default(false),
  hasVoiceNote: yup.boolean().default(false),
  hasAttachments: yup.boolean().default(false),
  period: yup.string().optional(),
  peopleAware: yup.string().optional(),
  anonymous: yup.string().optional(),
  people: yup.array().of(
    yup.object().shape({
      name: yup.string(),
      designation: yup.string(),
      department: yup.string(),
    })
  ).optional(),
});

const ReportForm = ({ onSubmitSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [voiceNote, setVoiceNote] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [useVoiceToText, setUseVoiceToText] = useState(false);
  const [voiceToTextResult, setVoiceToTextResult] = useState('');
  const [isRecordingText, setIsRecordingText] = useState(false);
  const fileInputRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue, control, watch } = useForm({
    resolver: yupResolver(reportSchema),
    defaultValues: {
      title: '',
      description: '',
      submitter: '',
      email: '',
      phone: '',
      criticality: 3,
      rewardWallet: '',
      department: '',
      location: '',
      monetaryValue: '',
      relationship: '',
      encounter: '',
      authoritiesAware: false,
      hasVoiceNote: false,
      hasAttachments: false,
      period: 'Less than a month ago',
      peopleAware: 'not_aware',
      anonymous: 'anonymous',
      people: [{ name: '', designation: '', department: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'people',
  });

  const handleVoiceRecording = (audioBlob) => {
    if (audioBlob) {
      setVoiceNote(audioBlob);
      setValue('hasVoiceNote', true);
    } else {
      setVoiceNote(null);
      setValue('hasVoiceNote', false);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    
    if (files.length > 0) {
      // Convert FileList to array and add to attachments
      const newAttachments = [...attachments];
      
      for (let i = 0; i < files.length; i++) {
        // Check file size (15MB limit)
        if (files[i].size > 15 * 1024 * 1024) {
          setError(`File ${files[i].name} exceeds 15MB size limit`);
          continue;
        }
        
        newAttachments.push(files[i]);
      }
      
      setAttachments(newAttachments);
      setValue('hasAttachments', newAttachments.length > 0);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
    setValue('hasAttachments', newAttachments.length > 0);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Voice to text functions
  const startSpeechRecognition = () => {
    // Check if the browser supports the Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice-to-text is not supported in this browser');
      return;
    }

    setIsRecordingText(true);

    // Create a new speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      setVoiceToTextResult(finalTranscript + interimTranscript);
      setValue('description', finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsRecordingText(false);
    };

    recognition.onend = () => {
      setIsRecordingText(false);
    };

    recognition.start();

    // Store the recognition instance to stop it later
    window.recognitionInstance = recognition;
  };

  const stopSpeechRecognition = () => {
    if (window.recognitionInstance) {
      window.recognitionInstance.stop();
      setIsRecordingText(false);
    }
  };

  const onSubmit = async (data) => {
    console.log('Form submitted:', data);
    setIsSubmitting(true);
    setError(null);

    try {
      // Create a FormData object to handle file uploads
      const formData = new FormData();
      
      // Add text fields to the form data
      Object.keys(data).forEach(key => {
        if (key !== 'hasVoiceNote' && key !== 'hasAttachments' && key !== 'people') {
          formData.append(key, data[key]);
        }
      });
      
      // Add the people array as JSON
      formData.append('people', JSON.stringify(data.people));
      
      // Add voice note if present
      if (voiceNote) {
        formData.append('voiceNote', voiceNote);
      }
      
      // Add voice to text result if present
      if (voiceToTextResult) {
        formData.append('voiceToText', voiceToTextResult);
      }
      
      // Add attachments if present
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const result = await submitReport(formData);
      reset();
      setVoiceNote(null);
      setAttachments([]);
      setVoiceToTextResult('');
      onSubmitSuccess(result);
    } catch (err) {
      setError(err.message || 'An error occurred while submitting the report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="report-form">
      <h2>Submit a Whistleblower Report</h2>
      <p className="form-intro">All reports are encrypted and stored securely on blockchain.</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-section">
          <h3>Relationship</h3>
          <div className="form-group">
            <label htmlFor="relationship">Your relationship with the organization</label>
            <select id="relationship" {...register('relationship')}>
              <option value="">Select relationship</option>
              <option value="Employee">Employee</option>
              <option value="Customer">Customer</option>
              <option value="Supplier">Supplier</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Encounter</h3>
          <div className="form-group">
            <label htmlFor="encounter">How did you encounter this issue?</label>
            <select id="encounter" {...register('encounter')}>
              <option value="">Select option</option>
              <option value="It happened to me">It happened to me</option>
              <option value="I witnessed it">I witnessed it</option>
              <option value="I was told about it">I was told about it</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Department & Location</h3>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              id="department"
              type="text"
              {...register('department')}
              placeholder="Which department is involved?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              {...register('location')}
              placeholder="City, country, or office location"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Financial Impact</h3>
          <div className="form-group">
            <label htmlFor="monetaryValue">Approximate monetary value</label>
            <select id="monetaryValue" {...register('monetaryValue')}>
              <option value="">Select range</option>
              <option value="Under $1,000">Under $1,000</option>
              <option value="$1,000 to $10,000">$1,000 to $10,000</option>
              <option value="$10,000 to $100,000">$10,000 to $100,000</option>
              <option value="$100,000 to $500,000">$100,000 to $500,000</option>
              <option value="$500,000 and Above">$500,000 and Above</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Time Period</h3>
          <div className="form-group">
            <div className="radio-group">
              <label>When did this happen?</label>
              <div className="radio-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register('period')}
                    value="Less than a month ago"
                  />
                  Less than a month ago
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register('period')}
                    value="1 to 3 months ago"
                  />
                  1 to 3 months ago
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register('period')}
                    value="3 to 6 months ago"
                  />
                  3 to 6 months ago
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register('period')}
                    value="Over 6 months ago"
                  />
                  Over 6 months ago
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>People Involved</h3>
          <div className="form-group">
            <div className="radio-group">
              <label>Are the people involved aware of your report?</label>
              <div className="radio-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register('peopleAware')}
                    value="not_aware"
                  />
                  Not Aware
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register('peopleAware')}
                    value="aware"
                  />
                  Aware
                </label>
              </div>
            </div>
          </div>

          <div className="person-fields">
            {fields.map((field, index) => (
              <div key={field.id} className="person-entry">
                <div className="form-group">
                  <label htmlFor={`people.${index}.name`}>Full Name</label>
                  <input
                    id={`people.${index}.name`}
                    type="text"
                    {...register(`people.${index}.name`)}
                    placeholder="Full Name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`people.${index}.designation`}>Designation</label>
                  <input
                    id={`people.${index}.designation`}
                    type="text"
                    {...register(`people.${index}.designation`)}
                    placeholder="Designation"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`people.${index}.department`}>Department</label>
                  <input
                    id={`people.${index}.department`}
                    type="text"
                    {...register(`people.${index}.department`)}
                    placeholder="Department"
                  />
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    className="remove-person-button"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="add-person-button"
              onClick={() => append({ name: '', designation: '', department: '' })}
            >
              + Add Person
            </button>
          </div>
        </div>

        <div className="form-section">
          <h3>Your Details</h3>
          <div className="form-group">
            <div className="radio-group">
              <label>Would you like to disclose your identity?</label>
              <div className="radio-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register('anonymous')}
                    value="anonymous"
                  />
                  Keep me Anonymous
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register('anonymous')}
                    value="disclose"
                  />
                  I'm willing to disclose
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="submitter">Full Name (Optional)</label>
            <input
              id="submitter"
              type="text"
              {...register('submitter')}
              placeholder="Your name (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (Optional)</label>
            <input
              id="email"
              type="email"
              {...register('email')}
              placeholder="Your email (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone (Optional)</label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="Your phone (optional)"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Authorities</h3>
          <div className="form-group">
            <div className="radio-group">
              <label>Have you already reported this to authorities?</label>
              <div className="radio-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register('authoritiesAware')}
                    value={false}
                  />
                  No
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    {...register('authoritiesAware')}
                    value={true}
                  />
                  Yes
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Incident Information</h3>
          <div className="form-group">
            <label htmlFor="title">Report Title</label>
            <input
              id="title"
              type="text"
              {...register('title')}
              placeholder="Briefly describe the issue"
            />
            {errors.title && <span className="error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description</label>
            <div className="description-container">
              <textarea
                id="description"
                {...register('description')}
                rows="8"
                placeholder="Provide details about the incident or concern. Include dates, names, locations, and any other relevant information."
                value={watch('description')}
              ></textarea>
              
              <div className="voice-to-text-controls">
                {!isRecordingText ? (
                  <button 
                    type="button" 
                    className="voice-to-text-button"
                    onClick={startSpeechRecognition}
                  >
                    <FaMicrophoneAlt /> Voice to Text
                  </button>
                ) : (
                  <button 
                    type="button" 
                    className="voice-to-text-button recording"
                    onClick={stopSpeechRecognition}
                  >
                    <FaStop /> Stop Recording
                  </button>
                )}
              </div>
            </div>
            {errors.description && <span className="error">{errors.description.message}</span>}
            {isRecordingText && (
              <div className="recording-indicator">
                <span className="pulse"></span> Listening... (Speak clearly into your microphone)
              </div>
            )}
          </div>

          <div className="form-group voice-note-section">
            <label>Voice Recording</label>
            <div className="voice-note-container">
              <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
            </div>
            <div className="form-help">
              <FaInfoCircle /> You can submit a voice note instead of typing if you prefer.
            </div>
          </div>

          <div className="form-group">
            <label>File Attachments</label>
            <div className="file-upload-container">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                multiple
                style={{ display: 'none' }}
                ref={fileInputRef}
              />
              <button
                type="button"
                className="file-upload-button"
                onClick={() => fileInputRef.current.click()}
              >
                <FaFileUpload /> Upload Files
              </button>
              <div className="form-help">
                <FaInfoCircle /> Supported file types: PDF, Word, Excel, PowerPoint, images, and text files (Max 15MB each)
              </div>
            </div>
            
            {attachments.length > 0 && (
              <div className="attachments-list">
                <h4>Attached Files:</h4>
                <ul>
                  {attachments.map((file, index) => (
                    <li key={index}>
                      <div className="attachment-item">
                        <span className="attachment-name">{file.name}</span>
                        <span className="attachment-size">({formatFileSize(file.size)})</span>
                        <button
                          type="button"
                          className="remove-attachment-button"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Details</h3>
          <div className="form-group">
            <label htmlFor="criticality">Criticality Level (1-5)</label>
            <select id="criticality" {...register('criticality')}>
              <option value="1">1 - Low (Minor policy violation)</option>
              <option value="2">2 - Somewhat concerning (Potential misconduct)</option>
              <option value="3">3 - Moderate (Serious misconduct)</option>
              <option value="4">4 - Serious (Significant violation or fraud)</option>
              <option value="5">5 - Critical (Severe violation, safety risk, or large-scale fraud)</option>
            </select>
            <div className="form-help">How serious do you consider this issue?</div>
            {errors.criticality && <span className="error">{errors.criticality.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="rewardWallet">Crypto Wallet Address (Optional)</label>
            <input
              id="rewardWallet"
              type="text"
              {...register('rewardWallet')}
              placeholder="Your cryptocurrency wallet address for rewards"
            />
            <div className="form-help">
              If your report leads to successful action, you may receive a reward.
              This remains anonymous and is not linked to your identity.
            </div>
          </div>
        </div>

        <div className="form-footer">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
