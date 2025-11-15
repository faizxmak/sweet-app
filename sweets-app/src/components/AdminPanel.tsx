import { useState } from 'react'
import { useSweets, type Sweet } from '../context/SweetContext'
import '../styles/AdminPanel.css'

interface AdminPanelProps {
  onBack: () => void
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { sweets, addSweet, updateSweet, deleteSweet } = useSweets()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: 500,
    quantity: 10,
    image: '🍬',
    description: '',
    category: 'Traditional',
  })

  const categories = ['Traditional', 'Fudge', 'Balls', 'Fried', 'Cooked', 'Mixed', 'Premium']

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'quantity' ? parseInt(value) : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description) {
      alert('Please fill in all required fields')
      return
    }

    if (editingId) {
      updateSweet(editingId, formData as Partial<Sweet>)
      setEditingId(null)
    } else {
      addSweet(formData as Omit<Sweet, 'id'>)
    }

    setFormData({
      name: '',
      price: 500,
      quantity: 10,
      image: '🍬',
      description: '',
      category: 'Traditional',
    })
    setShowForm(false)
  }

  const handleEdit = (sweet: Sweet) => {
    setFormData({
      name: sweet.name,
      price: sweet.price,
      quantity: sweet.quantity,
      image: sweet.image,
      description: sweet.description,
      category: sweet.category,
    })
    setEditingId(sweet.id)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      price: 500,
      quantity: 10,
      image: '🍬',
      description: '',
      category: 'Traditional',
    })
  }

  return (
    <div className="admin-panel">
      {/* Header */}
      <header className="admin-header">
        <h1>⚙️ Admin Panel</h1>
        <button className="back-button" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </header>

      <main className="admin-main">
        {/* Add/Edit Form */}
        <section className="form-section">
          <div className="section-header">
            <h2>{editingId ? 'Edit Sweet' : 'Add New Sweet'}</h2>
            {!showForm && (
              <button
                className="action-button add-button"
                onClick={() => setShowForm(true)}
              >
                ➕ Add New Sweet
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Sweet Name *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Gulab Jamun"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="image">Emoji Icon</label>
                  <input
                    id="image"
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="🍬"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (₹) *</label>
                  <input
                    id="price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="500"
                    max="1500"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">Quantity *</label>
                  <input
                    id="quantity"
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe this sweet..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="action-button submit-button">
                  {editingId ? '✏️ Update Sweet' : '➕ Add Sweet'}
                </button>
                <button
                  type="button"
                  className="action-button cancel-button"
                  onClick={handleCancel}
                >
                  ✕ Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Sweets List */}
        <section className="list-section">
          <h2>All Sweets ({sweets.length})</h2>

          <div className="sweets-table-wrapper">
            <table className="sweets-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sweets.map((sweet) => (
                  <tr key={sweet.id} className={sweet.quantity === 0 ? 'out-of-stock-row' : ''}>
                    <td className="emoji-cell">{sweet.image}</td>
                    <td className="name-cell">{sweet.name}</td>
                    <td className="category-cell">{sweet.category}</td>
                    <td className="price-cell">₹{sweet.price}</td>
                    <td className="quantity-cell">
                      <span className={sweet.quantity === 0 ? 'zero' : ''}>
                        {sweet.quantity}
                      </span>
                    </td>
                    <td className="description-cell">{sweet.description}</td>
                    <td className="actions-cell">
                      <button
                        className="action-button edit-button"
                        onClick={() => handleEdit(sweet)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => {
                          if (window.confirm(`Delete ${sweet.name}?`)) {
                            deleteSweet(sweet.id)
                          }
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
