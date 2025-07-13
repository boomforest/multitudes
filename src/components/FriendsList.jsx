import React, { useState } from 'react'
import { Users, Plus, Settings, LogOut, Edit3, Trash2, User, Eye } from 'lucide-react'
import ProfilePicture from './ProfilePicture'

function FriendsList({
  friends,
  profile,
  user,
  supabase,
  onAddFriend,
  onEditOfrenda,
  onUpdateFriend,
  onDeleteFriend,
  onViewFriend,
  onLogout,
  onProfileUpdate,
  message
}) {
  const [editingFriend, setEditingFriend] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', color: '', notes: '' })

  const colorCounts = {
    green: friends.filter(f => f.color_code === 'green').length,
    yellow: friends.filter(f => f.color_code === 'yellow').length,
    red: friends.filter(f => f.color_code === 'red').length
  }

  const startEditing = (friend) => {
    setEditingFriend(friend.id)
    setEditForm({
      name: friend.friend_name,
      color: friend.color_code,
      notes: friend.notes || ''
    })
  }

  const saveEdit = () => {
    onUpdateFriend(editingFriend, {
      friend_name: editForm.name,
      color_code: editForm.color,
      notes: editForm.notes
    })
    setEditingFriend(null)
  }

  const cancelEdit = () => {
    setEditingFriend(null)
    setEditForm({ name: '', color: '', notes: '' })
  }

  const getColorStyle = (color) => {
    const colors = {
      green: { bg: '#d4edda', border: '#28a745', text: '#155724' },
      yellow: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
      red: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' }
    }
    return colors[color] || colors.green
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
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ProfilePicture
            supabase={supabase}
            user={user}
            profile={profile}
            onProfileUpdate={onProfileUpdate}
            size="medium"
            showUpload={true}
          />
          <div>
            <h1 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              margin: '0',
              color: '#d2691e'
            }}>
              MULTITUDES
            </h1>
            <p style={{ 
              color: '#8b4513', 
              margin: '0.2rem 0 0 0',
              fontSize: '0.9rem'
            }}>
              Welcome, {profile?.username || 'User'}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Section - Always Visible */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#8b4513' }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={onEditOfrenda}
            style={{
              padding: '0.8rem 1.2rem',
              backgroundColor: '#d2691e',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <User size={16} />
            Edit Ofrenda Profile
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: '0.8rem 1.2rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '15px',
          marginBottom: '1rem',
          backgroundColor: message.includes('successful') || message.includes('Added') || message.includes('updated') || message.includes('saved') ? '#d4edda' : 
                         message.includes('failed') || message.includes('Error') ? '#f8d7da' : '#fff3cd',
          color: message.includes('successful') || message.includes('Added') || message.includes('updated') || message.includes('saved') ? '#155724' : 
                 message.includes('failed') || message.includes('Error') ? '#721c24' : '#856404',
          fontSize: '0.9rem'
        }}>
          {message}
        </div>
      )}

      {/* Stats Overview */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#8b4513' }}>Your Network</h3>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              borderRadius: '12px',
              padding: '0.8rem',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              {colorCounts.green}
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#155724' }}>Acquaintances</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#fff3cd',
              color: '#856404',
              borderRadius: '12px',
              padding: '0.8rem',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              {colorCounts.yellow}
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#856404' }}>Friends</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '12px',
              padding: '0.8rem',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              {colorCounts.red}
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#721c24' }}>Deep Connections</p>
          </div>
        </div>
      </div>

      {/* Add Friend Button */}
      <button
        onClick={onAddFriend}
        style={{
          width: '100%',
          padding: '1.2rem',
          backgroundColor: '#d2691e',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: '600',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 15px rgba(210, 105, 30, 0.3)'
        }}
      >
        <Plus size={20} />
        Add Friend
      </button>

      {/* Friends List */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <Users size={20} color="#8b4513" />
          <h3 style={{ margin: '0', color: '#8b4513' }}>
            Friends ({friends.length})
          </h3>
        </div>

        {friends.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: '#999',
            fontSize: '0.9rem'
          }}>
            No friends added yet. Click "Add Friend" to get started!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {friends.map((friend) => {
              const colorStyle = getColorStyle(friend.color_code)
              const isEditing = editingFriend === friend.id

              return (
                <div
                  key={friend.id}
                  style={{
                    backgroundColor: colorStyle.bg,
                    border: `2px solid ${colorStyle.border}`,
                    borderRadius: '15px',
                    padding: '1rem'
                  }}
                >
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          fontSize: '0.9rem'
                        }}
                        placeholder="Friend name"
                      />
                      <select
                        value={editForm.color}
                        onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="green">Green</option>
                        <option value="yellow">Yellow</option>
                        <option value="red">Red</option>
                      </select>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          marginBottom: '0.5rem',
                          fontSize: '0.9rem',
                          resize: 'vertical',
                          minHeight: '60px'
                        }}
                        placeholder="Notes (optional)"
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={saveEdit}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem'
                      }}>
                        <div>
                          <h4 style={{
                            margin: '0 0 0.2rem 0',
                            color: colorStyle.text,
                            fontSize: '1.1rem'
                          }}>
                            {friend.friend_name}
                          </h4>
                          <span style={{
                            backgroundColor: colorStyle.border,
                            color: 'white',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: '500',
                            textTransform: 'uppercase'
                          }}>
                            {friend.color_code}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <button
                            onClick={() => onViewFriend && onViewFriend(friend)}
                            style={{
                              padding: '0.4rem',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: colorStyle.text
                            }}
                            title="View profile"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => startEditing(friend)}
                            style={{
                              padding: '0.4rem',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: colorStyle.text
                            }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteFriend(friend.id)}
                            style={{
                              padding: '0.4rem',
                              backgroundColor: 'transparent',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#dc3545'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      {friend.notes && (
                        <p style={{
                          margin: '0.5rem 0 0 0',
                          color: colorStyle.text,
                          fontSize: '0.9rem',
                          opacity: 0.8
                        }}>
                          {friend.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendsList
