import React, { useState, useEffect } from 'react'
import { ArrowLeft, User, Star, Brain, Heart, Calendar, MapPin, Coffee, Save, Eye, EyeOff, Lock } from 'lucide-react'

function OfrendaProfile({ onBack, onSave, initialData, message }) {
  const [formData, setFormData] = useState({
    astro_sign: '',
    astro_sign_privacy: 'yellow',
    myers_briggs: '',
    myers_briggs_privacy: 'yellow',
    love_language: '',
    love_language_privacy: 'yellow',
    birth_month: '',
    birth_month_privacy: 'yellow',
    hometown: '',
    hometown_privacy: 'yellow',
    favorite_drink: '',
    favorite_drink_privacy: 'yellow',
    life_motto: '',
    life_motto_privacy: 'yellow',
    biggest_fear: '',
    biggest_fear_privacy: 'yellow',
    proudest_moment: '',
    proudest_moment_privacy: 'yellow',
    comfort_food: '',
    comfort_food_privacy: 'yellow',
    ideal_weekend: '',
    ideal_weekend_privacy: 'yellow',
    photos: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        astro_sign: initialData.astro_sign || '',
        astro_sign_privacy: initialData.astro_sign_privacy || 'yellow',
        myers_briggs: initialData.myers_briggs || '',
        myers_briggs_privacy: initialData.myers_briggs_privacy || 'yellow',
        love_language: initialData.love_language || '',
        love_language_privacy: initialData.love_language_privacy || 'yellow',
        birth_month: initialData.birth_month || '',
        birth_month_privacy: initialData.birth_month_privacy || 'yellow',
        hometown: initialData.hometown || '',
        hometown_privacy: initialData.hometown_privacy || 'yellow',
        favorite_drink: initialData.favorite_drink || '',
        favorite_drink_privacy: initialData.favorite_drink_privacy || 'yellow',
        life_motto: initialData.life_motto || '',
        life_motto_privacy: initialData.life_motto_privacy || 'yellow',
        biggest_fear: initialData.biggest_fear || '',
        biggest_fear_privacy: initialData.biggest_fear_privacy || 'yellow',
        proudest_moment: initialData.proudest_moment || '',
        proudest_moment_privacy: initialData.proudest_moment_privacy || 'yellow',
        comfort_food: initialData.comfort_food || '',
        comfort_food_privacy: initialData.comfort_food_privacy || 'yellow',
        ideal_weekend: initialData.ideal_weekend || '',
        ideal_weekend_privacy: initialData.ideal_weekend_privacy || 'yellow',
        photos: initialData.photos || []
      })
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

  const astroSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ]

  const myersBriggsTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ]

  const loveLanguages = [
    'Words of Affirmation', 'Acts of Service', 'Receiving Gifts', 
    'Quality Time', 'Physical Touch'
  ]

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const TextInputWithPrivacy = ({ label, field, placeholder, multiline = false }) => {
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
        
        {multiline ? (
          <textarea
            key={field}
            value={formData[field] || ''}
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
            key={field}
            type="text"
            value={formData[field] || ''}
            onChange={(e) => updateField(field, e.target.value)}
            placeholder={placeholder}
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
        
        {/* Privacy Controls */}
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
          value={formData[field]}
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
        
        {/* Privacy Controls */}
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
      {/* Header */}
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

      {/* Privacy Info */}
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

      {/* Message */}
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
        {/* Personality & Traits */}
        <FormSection icon={Brain} title="Personality & Traits">
          <SelectInputWithPrivacy
            label="Astrological Sign"
            field="astro_sign"
            options={astroSigns}
            placeholder="Select your sign"
          />
          <SelectInputWithPrivacy
            label="Myers-Briggs Type"
            field="myers_briggs"
            options={myersBriggsTypes}
            placeholder="Select your type"
          />
          <SelectInputWithPrivacy
            label="Love Language"
            field="love_language"
            options={loveLanguages}
            placeholder="How do you give/receive love?"
          />
        </FormSection>

        {/* Background & Origins */}
        <FormSection icon={MapPin} title="Background & Origins">
          <SelectInputWithPrivacy
            label="Birth Month"
            field="birth_month"
            options={months}
            placeholder="Select your birth month"
          />
          <TextInputWithPrivacy
            label="Hometown"
            field="hometown"
            placeholder="Where did you grow up?"
          />
        </FormSection>

        {/* Preferences & Habits */}
        <FormSection icon={Coffee} title="Preferences & Habits">
          <TextInputWithPrivacy
            label="Favorite Drink"
            field="favorite_drink"
            placeholder="Coffee, tea, wine, soda..."
          />
          <TextInputWithPrivacy
            label="Comfort Food"
            field="comfort_food"
            placeholder="What food brings you joy?"
          />
          <TextInputWithPrivacy
            label="Ideal Weekend"
            field="ideal_weekend"
            placeholder="How do you like to spend your free time?"
            multiline
          />
        </FormSection>

        {/* Inner World */}
        <FormSection icon={Heart} title="Inner World">
          <TextInputWithPrivacy
            label="Life Motto"
            field="life_motto"
            placeholder="Words you live by..."
          />
          <TextInputWithPrivacy
            label="Biggest Fear"
            field="biggest_fear"
            placeholder="What keeps you up at night?"
          />
          <TextInputWithPrivacy
            label="Proudest Moment"
            field="proudest_moment"
            placeholder="A time you felt most accomplished..."
            multiline
          />
        </FormSection>

        {/* Save Button */}
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
