import React, { useState, useEffect } from 'react'
import { ArrowLeft, User, Star, Brain, Heart, Calendar, MapPin, Coffee, Save } from 'lucide-react'

function OfrendaProfile({ onBack, onSave, initialData, message }) {
  const [formData, setFormData] = useState({
    astro_sign: '',
    myers_briggs: '',
    love_language: '',
    birth_month: '',
    hometown: '',
    favorite_drink: '',
    life_motto: '',
    biggest_fear: '',
    proudest_moment: '',
    comfort_food: '',
    ideal_weekend: '',
    photos: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        astro_sign: initialData.astro_sign || '',
        myers_briggs: initialData.myers_briggs || '',
        love_language: initialData.love_language || '',
        birth_month: initialData.birth_month || '',
        hometown: initialData.hometown || '',
        favorite_drink: initialData.favorite_drink || '',
        life_motto: initialData.life_motto || '',
        biggest_fear: initialData.biggest_fear || '',
        proudest_moment: initialData.proudest_moment || '',
        comfort_food: initialData.comfort_food || '',
        ideal_weekend: initialData.ideal_weekend || '',
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

  const TextInput = ({ label, field, placeholder, multiline = false }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        color: '#8b4513',
        fontWeight: '500',
        fontSize: '0.9rem'
      }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          value={formData[field]}
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
          type="text"
          value={formData[field]}
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
    </div>
  )

  const SelectInput = ({ label, field, options, placeholder }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5rem',
        color: '#8b4513',
        fontWeight: '500',
        fontSize: '0.9rem'
      }}>
        {label}
      </label>
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
    </div>
  )

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
          <SelectInput
            label="Astrological Sign"
            field="astro_sign"
            options={astroSigns}
            placeholder="Select your sign"
          />
          <SelectInput
            label="Myers-Briggs Type"
            field="myers_briggs"
            options={myersBriggsTypes}
            placeholder="Select your type"
          />
          <SelectInput
            label="Love Language"
            field="love_language"
            options={loveLanguages}
            placeholder="How do you give/receive love?"
          />
        </FormSection>

        {/* Background & Origins */}
        <FormSection icon={MapPin} title="Background & Origins">
          <SelectInput
            label="Birth Month"
            field="birth_month"
            options={months}
            placeholder="Select your birth month"
          />
          <TextInput
            label="Hometown"
            field="hometown"
            placeholder="Where did you grow up?"
          />
        </FormSection>

        {/* Preferences & Habits */}
        <FormSection icon={Coffee} title="Preferences & Habits">
          <TextInput
            label="Favorite Drink"
            field="favorite_drink"
            placeholder="Coffee, tea, wine, soda..."
          />
          <TextInput
            label="Comfort Food"
            field="comfort_food"
            placeholder="What food brings you joy?"
          />
          <TextInput
            label="Ideal Weekend"
            field="ideal_weekend"
            placeholder="How do you like to spend your free time?"
            multiline
          />
        </FormSection>

        {/* Inner World */}
        <FormSection icon={Heart} title="Inner World">
          <TextInput
            label="Life Motto"
            field="life_motto"
            placeholder="Words you live by..."
          />
          <TextInput
            label="Biggest Fear"
            field="biggest_fear"
            placeholder="What keeps you up at night?"
          />
          <TextInput
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
