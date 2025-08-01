import React, { useState, useEffect } from 'react'
import { ArrowLeft, User, Star, Brain, Calendar, MapPin, Plus, Trash2, Save, Eye, EyeOff, Lock } from 'lucide-react'

function OfrendaProfile({ onBack, onSave, initialData, message }) {
  const [formData, setFormData] = useState({
    zodiac_sign: '',
    zodiac_sign_privacy: 'yellow',
    // Individual zodiac placement fields will be added dynamically
    myers_briggs: '',
    myers_briggs_privacy: 'yellow',
    human_design: '',
    human_design_privacy: 'yellow',
    enneagram: '',
    enneagram_privacy: 'yellow',
    custom_fields: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        zodiac_sign: initialData.zodiac_sign || '',
        zodiac_sign_privacy: initialData.zodiac_sign_privacy || 'yellow',
        myers_briggs: initialData.myers_briggs || '',
        myers_briggs_privacy: initialData.myers_briggs_privacy || 'yellow',
        human_design: initialData.human_design || '',
        human_design_privacy: initialData.human_design_privacy || 'yellow',
        enneagram: initialData.enneagram || '',
        enneagram_privacy: initialData.enneagram_privacy || 'yellow',
        custom_fields: initialData.custom_fields || []
      }))
    }
  }, [initialData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving ofrenda data:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Scorpio/Ophiuchus', 'Ophiuchus', 'Sagittarius/Ophiuchus', 'Sagittarius', 
    'Capricorn', 'Aquarius', 'Pisces'
  ]

  const zodiacPlacements = [
    'Sun', 'Moon', 'Rising', 'Mercury', 'Venus', 'Mars', 
    'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'North Node', 'South Node',
    'Midheaven', 'IC', 'Descendant', 'Chiron', 'Lilith'
  ]

  const allZodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Scorpio/Ophiuchus', 'Ophiuchus', 'Sagittarius/Ophiuchus', 'Sagittarius', 
    'Capricorn', 'Aquarius', 'Pisces'
  ]

  const myersBriggsTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ]

  const enneagramTypes = [
    '1 - The Perfectionist', '2 - The Helper', '3 - The Achiever',
    '4 - The Individualist', '5 - The Investigator', '6 - The Loyalist',
    '7 - The Enthusiast', '8 - The Challenger', '9 - The Peacemaker'
  ]

  const updateField = React.useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const addCustomField = () => {
    const newField = {
      id: Date.now(),
      label: '',
      value: '',
      privacy: 'yellow'
    }
    setFormData(prev => ({
      ...prev,
      custom_fields: [...prev.custom_fields, newField]
    }))
  }

  const updateCustomField = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      custom_fields: prev.custom_fields.map(cf => 
        cf.id === id ? { ...cf, [field]: value } : cf
      )
    }))
  }

  const removeCustomField = (id) => {
    setFormData(prev => ({
      ...prev,
      custom_fields: prev.custom_fields.filter(cf => cf.id !== id)
    }))
  }

  const getPrivacyIcon = (level) => {
    switch (level) {
      case 'green': return <Eye size={14} color="#28a745" />
      case 'yellow': return <EyeOff size={14} color="#ffc107" />
      case 'red': return <Lock size={14} color="#dc3545" />
      default: return <EyeOff size={14} color="#ffc107" />
    }
  }

  const getPrivacyLabel = (level) => {
    switch (level) {
      case 'green': return 'Acquaintances can see'
      case 'yellow': return 'Friends can see'
      case 'red': return 'Deep connections only'
      default: return 'Friends can see'
    }
  }

  const getPrivacyColor = (level) => {
    switch (level) {
      case 'green': return { bg: '#d4edda', border: '#28a745', text: '#155724' }
      case 'yellow': return { bg: '#fff3cd', border: '#ffc107', text: '#856404' }
      case 'red': return { bg: '#f8d7da', border: '#dc3545', text: '#721c24' }
      default: return { bg: '#fff3cd', border: '#ffc107', text: '#856404' }
    }
  }

  const FormSection = ({ icon: Icon, title, children }) => (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ 
        margin: '0 0 1.5rem 0', 
        color: '#8b4513',
        fontSize: '1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Icon size={20} />
        {title}
      </h3>
      {children}
    </div>
  )

  const TextInputWithPrivacy = React.memo(({ label, field, placeholder, multiline = false }) => {
    const privacyField = `${field}_privacy`
    const privacyLevel = formData[privacyField] || 'yellow'
    const privacyStyle = getPrivacyColor(privacyLevel)
    
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <label style={{
            color: '#8b4513',
            fontWeight: '500',
            fontSize: '0.9rem'
          }}>
            {label}
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: privacyStyle.bg,
            border: `1px solid ${privacyStyle.border}`,
            borderRadius: '20px',
            padding: '0.3rem 0.8rem',
            fontSize: '0.75rem',
            color: privacyStyle.text
          }}>
            {getPrivacyIcon(privacyLevel)}
            <span>{getPrivacyLabel(privacyLevel)}</span>
          </div>
        </div>
        
        {multiline ? (
          <textarea
            key={`textarea-${field}`}
            defaultValue={formData[field] || ''}
            onChange={(e) => updateField(field, e.target.value)}
            placeholder={placeholder}
            rows={3}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '15px',
              fontSize: '0.9rem',
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#d2691e'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        ) : (
          <input
            key={`input-${field}`}
            type="text"
            defaultValue={formData[field] || ''}
            onChange={(e) => updateField(field, e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '15px',
              fontSize: '1rem',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#d2691e'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
        )}
        
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginTop: '0.5rem',
          justifyContent: 'flex-end'
        }}>
          {['green', 'yellow', 'red'].map((level) => {
            const isSelected = privacyLevel === level
            const style = getPrivacyColor(level)
            return (
              <button
                key={level}
                type="button"
                onClick={() => updateField(privacyField, level)}
                style={{
                  padding: '0.4rem 0.6rem',
                  backgroundColor: isSelected ? style.bg : 'transparent',
                  border: `1px solid ${style.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  color: isSelected ? style.text : style.border,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.2s'
                }}
              >
                {getPrivacyIcon(level)}
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            )
          })}
        </div>
      </div>
    )
  })

  const SelectInputWithPrivacy = ({ label, field, options, placeholder }) => {
    const privacyField = `${field}_privacy`
    const privacyLevel = formData[privacyField]
    const privacyStyle = getPrivacyColor(privacyLevel)
    
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
          <label style={{
            color: '#8b4513',
            fontWeight: '500',
            fontSize: '0.9rem'
          }}>
            {label}
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: privacyStyle.bg,
            border: `1px solid ${privacyStyle.border}`,
            borderRadius: '20px',
            padding: '0.3rem 0.8rem',
            fontSize: '0.75rem',
            color: privacyStyle.text
          }}>
            {getPrivacyIcon(privacyLevel)}
            <span>{getPrivacyLabel(privacyLevel)}</span>
          </div>
        </div>
        
        <select
          value={formData[field] || ''}
          onChange={(e) => updateField(field, e.target.value)}
          style={{
            width: '100%',
            padding: '1rem',
            border: '2px solid #e0e0e0',
            borderRadius: '15px',
            fontSize: '1rem',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#d2691e'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        >
          <option value="">{placeholder}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginTop: '0.5rem',
          justifyContent: 'flex-end'
        }}>
          {['green', 'yellow', 'red'].map((level) => {
            const isSelected = privacyLevel === level
            const style = getPrivacyColor(level)
            return (
              <button
                key={level}
                type="button"
                onClick={() => updateField(privacyField, level)}
                style={{
                  padding: '0.4rem 0.6rem',
                  backgroundColor: isSelected ? style.bg : 'transparent',
                  border: `1px solid ${style.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  color: isSelected ? style.text : style.border,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.2s'
                }}
              >
                {getPrivacyIcon(level)}
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5dc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.8rem',
            backgroundColor: '#f0f0f0',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#8b4513'
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            margin: '0',
            color: '#d2691e',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <User size={24} />
            Ofrenda Profile
          </h1>
          <p style={{ 
            color: '#8b4513', 
            margin: '0.2rem 0 0 0',
            fontSize: '0.9rem'
          }}>
            Share your essence with your network
          </p>
        </div>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <h4 style={{ margin: '0 0 0.8rem 0', color: '#8b4513' }}>Privacy Levels</h4>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Eye size={14} color="#28a745" />
            <span style={{ color: '#155724' }}>Acquaintances can see</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <EyeOff size={14} color="#ffc107" />
            <span style={{ color: '#856404' }}>Friends can see</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Lock size={14} color="#dc3545" />
            <span style={{ color: '#721c24' }}>Deep connections only</span>
          </div>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '15px',
          marginBottom: '1rem',
          backgroundColor: message.includes('saved') || message.includes('successful') ? '#d4edda' : 
                         message.includes('failed') || message.includes('Error') ? '#f8d7da' : '#fff3cd',
          color: message.includes('saved') || message.includes('successful') ? '#155724' : 
                 message.includes('failed') || message.includes('Error') ? '#721c24' : '#856404',
          fontSize: '0.9rem'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <FormSection icon={Brain} title="Personality Systems">
          <SelectInputWithPrivacy
            label="Zodiac Sign"
            field="zodiac_sign"
            options={zodiacSigns}
            placeholder="Select your main sign"
          />
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ 
              color: '#8b4513', 
              fontSize: '1rem', 
              margin: '0 0 1rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Star size={16} />
              Additional Placements
            </h4>
            
            {/* Fixed placement fields */}
            {zodiacPlacements.map((placement) => {
              const fieldKey = `zodiac_${placement.toLowerCase().replace(/\s+/g, '_')}`
              const privacyKey = `${fieldKey}_privacy`
              const currentValue = formData[fieldKey] || ''
              const currentPrivacy = formData[privacyKey] || 'yellow'
              const privacyStyle = getPrivacyColor(currentPrivacy)
              
              return (
                <div key={placement} style={{
                  backgroundColor: currentValue ? '#f8f9fa' : '#fafafa',
                  border: currentValue ? '2px solid #d2691e' : '1px solid #e0e0e0',
                  borderRadius: '15px',
                  padding: '1rem',
                  marginBottom: '0.8rem',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '0.8rem',
                    marginBottom: currentValue ? '0.5rem' : '0'
                  }}>
                    <label style={{
                      minWidth: '100px',
                      color: '#8b4513',
                      fontWeight: '500',
                      fontSize: '0.9rem'
                    }}>
                      {placement}
                    </label>
                    
                    <span style={{ color: '#8b4513', fontSize: '0.9rem' }}>in</span>
                    
                    <select
                      value={currentValue}
                      onChange={(e) => {
                        updateField(fieldKey, e.target.value)
                        // Set default privacy when first selected
                        if (e.target.value && !formData[privacyKey]) {
                          updateField(privacyKey, 'yellow')
                        }
                      }}
                      style={{
                        flex: '1',
                        padding: '0.6rem',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Not set</option>
                      {allZodiacSigns.map(sign => (
                        <option key={sign} value={sign}>{sign}</option>
                      ))}
                    </select>
                    
                    {currentValue && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        backgroundColor: privacyStyle.bg,
                        border: `1px solid ${privacyStyle.border}`,
                        borderRadius: '15px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.7rem',
                        color: privacyStyle.text
                      }}>
                        {getPrivacyIcon(currentPrivacy)}
                        <span>{currentPrivacy.charAt(0).toUpperCase() + currentPrivacy.slice(1)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Privacy Controls - only show if value is selected */}
                  {currentValue && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem', 
                      justifyContent: 'flex-end'
                    }}>
                      {['green', 'yellow', 'red'].map((level) => {
                        const isSelected = currentPrivacy === level
                        const style = getPrivacyColor(level)
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => updateField(privacyKey, level)}
                            style={{
                              padding: '0.3rem 0.5rem',
                              backgroundColor: isSelected ? style.bg : 'transparent',
                              border: `1px solid ${style.border}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.65rem',
                              color: isSelected ? style.text : style.border,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            {getPrivacyIcon(level)}
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          <SelectInputWithPrivacy
            label="Myers-Briggs Type"
            field="myers_briggs"
            options={myersBriggsTypes}
            placeholder="Select your type"
          />
          <TextInputWithPrivacy
            label="Human Design"
            field="human_design"
            placeholder="e.g., Generator 3/5, Sacral Authority"
          />
          <SelectInputWithPrivacy
            label="Enneagram"
            field="enneagram"
            options={enneagramTypes}
            placeholder="Select your type"
          />
        </FormSection>

        <FormSection icon={MapPin} title="Background">
          <p style={{ 
            color: '#8b4513', 
            fontSize: '0.9rem', 
            fontStyle: 'italic',
            margin: '0'
          }}>
            Use custom fields below to add birthday, hometown, or other background info
          </p>
        </FormSection>

        <FormSection icon={Star} title="Custom Fields">
          <p style={{ 
            color: '#8b4513', 
            fontSize: '0.9rem', 
            marginBottom: '1rem',
            fontStyle: 'italic'
          }}>
            Add any other details you want to share about yourself
          </p>
          
          {formData.custom_fields.map((field) => (
            <div key={field.id} style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: '15px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                  placeholder="Field name (e.g., Favorite Color)"
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    marginRight: '1rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeCustomField(field.id)}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                placeholder="Your answer"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  marginBottom: '0.5rem',
                  boxSizing: 'border-box'
                }}
              />
              
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                justifyContent: 'flex-end'
              }}>
                {['green', 'yellow', 'red'].map((level) => {
                  const isSelected = field.privacy === level
                  const style = getPrivacyColor(level)
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => updateCustomField(field.id, 'privacy', level)}
                      style={{
                        padding: '0.4rem 0.6rem',
                        backgroundColor: isSelected ? style.bg : 'transparent',
                        border: `1px solid ${style.border}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        color: isSelected ? style.text : style.border,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      {getPrivacyIcon(level)}
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addCustomField}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: 'transparent',
              border: '2px dashed #d2691e',
              borderRadius: '15px',
              cursor: 'pointer',
              color: '#d2691e',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#fff3e0'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            <Plus size={16} />
            Add Custom Field
          </button>
        </FormSection>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            padding: '1.2rem',
            backgroundColor: isSubmitting ? '#ccc' : '#d2691e',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: isSubmitting ? 'none' : '0 4px 15px rgba(210, 105, 30, 0.3)',
            transition: 'all 0.2s',
            marginBottom: '2rem'
          }}
        >
          <Save size={20} />
          {isSubmitting ? 'Saving Profile...' : 'Save Ofrenda Profile'}
        </button>
      </form>
    </div>
  )
}

export default OfrendaProfile
