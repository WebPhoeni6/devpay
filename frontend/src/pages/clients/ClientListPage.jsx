import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Pencil, Trash2, Plus, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import useClientStore from '../../stores/clientStore'

function ClientForm({ initial, onSubmit, loading, onClose }) {
  const [form, setForm] = useState(initial || { name: '', email: '', phone: '' })
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form) }}
      className="space-y-4"
    >
      <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
      <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
      <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Optional" />
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1 justify-center">
          {loading ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 justify-center">
          Cancel
        </Button>
      </div>
    </form>
  )
}

function SortIndicator({ active, direction }) {
  if (!active) return <ArrowUpDown size={14} className="text-[var(--text-muted)]" />
  return direction === 'asc'
    ? <ChevronUp size={14} className="text-[var(--primary)]" />
    : <ChevronDown size={14} className="text-[var(--primary)]" />
}

export default function ClientListPage() {
  const { clients, loading, fetchClients, createClient, updateClient, deleteClient } = useClientStore()
  const [modal, setModal] = useState(null) // null | { mode: 'create' } | { mode: 'edit', client }
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [phoneFilter, setPhoneFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [selectedRows, setSelectedRows] = useState(new Set())

  useEffect(() => { fetchClients() }, [fetchClients])

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '--')

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = clients.filter((client) => {
      const name = client.name?.toLowerCase() || ''
      const email = client.email?.toLowerCase() || ''
      const phone = client.phone?.toLowerCase() || ''

      const matchesSearch = !query || name.includes(query) || email.includes(query) || phone.includes(query)
      const hasPhone = Boolean(client.phone)
      const matchesPhone = phoneFilter === 'all'
        || (phoneFilter === 'with_phone' && hasPhone)
        || (phoneFilter === 'without_phone' && !hasPhone)

      return matchesSearch && matchesPhone
    })

    filtered.sort((a, b) => {
      const direction = sortConfig.direction === 'asc' ? 1 : -1
      switch (sortConfig.key) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '') * direction
        case 'email':
          return (a.email || '').localeCompare(b.email || '') * direction
        case 'phone':
          return (a.phone || '').localeCompare(b.phone || '') * direction
        case 'created_at':
        default:
          return ((new Date(a.created_at || 0)).getTime() - (new Date(b.created_at || 0)).getTime()) * direction
      }
    })

    return filtered
  }, [clients, search, phoneFilter, sortConfig])

  useEffect(() => {
    setSelectedRows((prev) => {
      const valid = new Set(clients.map((client) => String(client.id)))
      return new Set(Array.from(prev).filter((id) => valid.has(id)))
    })
  }, [clients])

  const visibleIds = filteredClients.map((client) => String(client.id))
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedRows.has(id))

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' }
      return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  const toggleRow = (id) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllVisible = () => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id))
      } else {
        visibleIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const handleCreate = async (form) => {
    setSaving(true)
    try {
      await createClient(form)
      toast.success('Client added')
      setModal(null)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add client')
    } finally { setSaving(false) }
  }

  const handleUpdate = async (form) => {
    setSaving(true)
    try {
      await updateClient(modal.client.id, form)
      toast.success('Client updated')
      setModal(null)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update client')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteClient(deleteId)
      toast.success('Client deleted')
    } catch {
      toast.error('Failed to delete client')
    } finally { setDeleteId(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Clients</h1>
          <p className="text-sm text-[var(--text-secondary)]">Manage your clients</p>
        </div>
        <Button onClick={() => setModal({ mode: 'create' })} className="flex items-center gap-2 justify-center w-full sm:w-auto">
          <Plus size={16} /> Add Client
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-[color:var(--border)] flex items-center justify-between flex-wrap gap-3">
          <div className="relative min-w-0 w-full sm:min-w-[240px] flex-1 max-w-full sm:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, email or phone"
              className="w-full border border-[color:var(--border-muted)] bg-[var(--bg-surface)] rounded-lg pl-9 pr-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <select
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value)}
            className="w-full sm:w-auto border border-[color:var(--border-muted)] bg-[var(--bg-surface)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All clients</option>
            <option value="with_phone">With phone</option>
            <option value="without_phone">Without phone</option>
          </select>
        </div>

        {selectedRows.size > 0 && (
          <div className="px-4 sm:px-6 py-3 border-b border-[color:var(--border)] bg-[var(--bg-surface-muted)] flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-[var(--text-secondary)]">
              {selectedRows.size} row{selectedRows.size === 1 ? '' : 's'} selected
            </p>
            <button
              type="button"
              onClick={() => setSelectedRows(new Set())}
              className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <div className="px-4 sm:px-6 py-8 text-sm text-[var(--text-secondary)]">Loading...</div>
        ) : filteredClients.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 text-sm text-[var(--text-secondary)]">No clients match your current filters.</div>
        ) : (
          <>
            <div className="sm:hidden divide-y divide-[color:var(--border)]">
              {filteredClients.map((client) => {
                const id = String(client.id)
                const isSelected = selectedRows.has(id)

                return (
                  <div
                    key={id}
                    className={`px-4 py-4 transition-colors ${
                      isSelected ? 'bg-[var(--row-selected)]' : 'hover:bg-[var(--row-hover)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(id)}
                        className="mt-1 h-4 w-4 accent-[var(--primary)]"
                        aria-label={`Select ${client.name}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{client.name}</p>
                        <p className="text-xs text-[var(--text-secondary)] truncate mt-1">{client.email}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
                          <p>Phone: {client.phone || '--'}</p>
                          <p className="text-right">Created: {formatDate(client.created_at)}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setModal({ mode: 'edit', client })}
                            className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--border-muted)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(client.id)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--border-muted)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-colors"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="text-xs text-[var(--text-secondary)] border-b border-[color:var(--border)]">
                    <th className="w-12 text-left py-3 px-3 sm:px-4">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        className="h-4 w-4 accent-[var(--primary)]"
                        aria-label="Select all visible clients"
                      />
                    </th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium">
                      <button type="button" onClick={() => toggleSort('name')} className="inline-flex items-center gap-1">
                        Name
                        <SortIndicator active={sortConfig.key === 'name'} direction={sortConfig.direction} />
                      </button>
                    </th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium">
                      <button type="button" onClick={() => toggleSort('email')} className="inline-flex items-center gap-1">
                        Email
                        <SortIndicator active={sortConfig.key === 'email'} direction={sortConfig.direction} />
                      </button>
                    </th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium">
                      <button type="button" onClick={() => toggleSort('phone')} className="inline-flex items-center gap-1">
                        Phone
                        <SortIndicator active={sortConfig.key === 'phone'} direction={sortConfig.direction} />
                      </button>
                    </th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium">
                      <button type="button" onClick={() => toggleSort('created_at')} className="inline-flex items-center gap-1">
                        Created At
                        <SortIndicator active={sortConfig.key === 'created_at'} direction={sortConfig.direction} />
                      </button>
                    </th>
                    <th className="text-left py-3 px-3 sm:px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => {
                    const id = String(client.id)
                    const isSelected = selectedRows.has(id)
                    return (
                      <tr
                        key={id}
                        className={`border-b border-[color:var(--border)] transition-colors ${
                          isSelected ? 'bg-[var(--row-selected)]' : 'hover:bg-[var(--row-hover)]'
                        }`}
                      >
                        <td className="py-3 px-3 sm:px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(id)}
                            className="h-4 w-4 accent-[var(--primary)]"
                            aria-label={`Select ${client.name}`}
                          />
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-sm font-medium text-[var(--text-primary)]">{client.name}</td>
                        <td className="py-3 px-3 sm:px-4 text-sm text-[var(--text-secondary)]">{client.email}</td>
                        <td className="py-3 px-3 sm:px-4 text-sm text-[var(--text-secondary)]">{client.phone || '--'}</td>
                        <td className="py-3 px-3 sm:px-4 text-sm text-[var(--text-secondary)]">{formatDate(client.created_at)}</td>
                        <td className="py-3 px-3 sm:px-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setModal({ mode: 'edit', client })}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] rounded-lg transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(client.id)}
                              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {modal && (
        <Modal
          title={modal.mode === 'create' ? 'Add Client' : 'Edit Client'}
          onClose={() => setModal(null)}
        >
          <ClientForm
            initial={modal.mode === 'edit' ? modal.client : undefined}
            onSubmit={modal.mode === 'create' ? handleCreate : handleUpdate}
            loading={saving}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}

      {deleteId && (
        <Modal title="Delete Client" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Are you sure you want to delete this client? This cannot be undone.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="danger" onClick={handleDelete} className="flex-1 justify-center">Delete</Button>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1 justify-center">Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

