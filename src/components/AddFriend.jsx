import React, { useState } from 'react'
import { ArrowLeft, UserPlus, Palette } from 'lucide-react'

function AddFriend({ onBack, onAddFriend, message }) {
  const [formData, setFormData] = useState({
    name: '',
    color: 'green',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onAddFriend(formData)
      // Form will be reset by parent component when navigating back
    } catch (error) {
      console.error('Error adding friend:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const colorOptions = [
    {
      value: 'green',
      label: 'Green',
      description: 'Acquaintances, casual connections',
      bg: '#d4edda',
      border: '#28a745',
      text: '#155724'
    },
    {
      value: 'yellow',
      label: 'Yellow', 
      description: 'Friends, regular connections',
      bg: '#fff3cd',
      border: '#ffc107',
      text: '#856404'
    },
    {
      value: 'red',
      label: 'Red',
      description: 'Deep connections, closest relationships',
      bg: '#f8d7da',
      border: '#dc3545',
      text: '#721c24'
    }
  ]

  const selectedColor = colorOptions.find(c => c.value === formData.color)

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
            <UserPlus size={24} />
            Add Friend
          </h1>
          <p style={{ 
            color: '#8b4513', 
            margin: '0.2rem 0 0 0',
            fontSize: '0.9rem'
          }}>
            Add someone to your network
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '15px',
          marginBottom: '1rem',
          backgroundColor: message.includes('successful') || message.includes('Added') ? '#d4edda' : 
                         message.includes('failed') || message.includes('Error') ? '#f8d7da' : '#fff3cd',
          color: message.includes('successful') || message.includes('Added') ? '#155724' : 
                 message.includes('failed') || message.includes('Error') ? '#721c24' : '#856404',
          fontSize: '0.9rem'
        }}>
          {message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
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
            fontSize: '1.2rem'
          }}>
            Friend Details
          </h3>

          {/* Name Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#8b4513',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              Friend's Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter their name"
              required
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
          </div>

          {/* Color Selection */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.8rem',
              color: '#8b4513',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              <Palette size={16} />
              Relationship Color *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {colorOptions.map((color) => (
                <label
                  key={color.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: formData.color === color.value ? color.bg : '#f8f9fa',
                    border: `2px solid ${formData.color === color.value ? color.border : '#e0e0e0'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name="color"
                    value={color.value}
                    checked={formData.color === color.value}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{
                      marginRight: '0.8rem',
                      accentColor: color.border
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.2rem'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: color.border,
                        borderRadius: '50%'
                      }}></div>
                      <span style={{
                        fontWeight: '600',
                        color: color.text,
                        fontSize: '1rem'
                      }}>
                        {color.label}
                      </span>
                    </div>
                    <p style={{
                      margin: '0',
                      fontSize: '0.8rem',
                      color: color.text,
                      opacity: 0.8
                    }}>
                      {color.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Notes Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#8b4513',
              fontWeight: '500',
              fontSize: '0.9rem'
            }}>
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this person..."
              rows={4}
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
          </div>
        </div>

        {/* Preview Card */}
        {formData.name && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '1rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#8b4513',
              fontSize: '1.2rem'
            }}>
              Preview
            </h3>
            <div style={{
              backgroundColor: selectedColor.bg,
              border: `2px solid ${selectedColor.border}`,
              borderRadius: '15px',
              padding: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.5rem'
              }}>
                <div>
                  <h4 style={{
                    margin: '0 0 0.2rem 0',
                    color: selectedColor.text,
                    fontSize: '1.1rem'
                  }}>
                    {formData.name}
                  </h4>
                  <span style={{
                    backgroundColor: selectedColor.border,
                    color: 'white',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: '500',
                    textTransform: 'uppercase'
                  }}>
                    {selectedColor.label}
                  </span>
                </div>
              </div>
              {formData.notes && (
                <p style={{
                  margin: '0.5rem 0 0 0',
                  color: selectedColor.text,
                  fontSize: '0.9rem',
                  opacity: 0.8
                }}>
                  {formData.notes}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!formData.name.trim() || isSubmitting}
          style={{
            width: '100%',
            padding: '1.2rem',
            backgroundColor: (!formData.name.trim() || isSubmitting) ? '#ccc' : '#d2691e',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: (!formData.name.trim() || isSubmitting) ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: (!formData.name.trim() || isSubmitting) ? 'none' : '0 4px 15px rgba(210, 105, 30, 0.3)',
            transition: 'all 0.2s'
          }}
        >
          <UserPlus size={20} />
          {isSubmitting ? 'Adding Friend...' : 'Add Friend'}
        </button>
      </form>
    </div>
  )
}

export default AddFriend
