import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Pencil, Trash2, Plus } from 'lucide-react'
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
      <div className="flex gap-3 pt-2">
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

export default function ClientListPage() {
  const { clients, loading, fetchClients, createClient, updateClient, deleteClient } = useClientStore()
  const [modal, setModal] = useState(null) // null | { mode: 'create' } | { mode: 'edit', client }
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => { fetchClients() }, [])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A2E]">Clients</h1>
          <p className="text-sm text-[#6B7280]">Manage your clients</p>
        </div>
        <Button onClick={() => setModal({ mode: 'create' })} className="flex items-center gap-2">
          <Plus size={16} /> Add Client
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="px-6 py-8 text-sm text-[#6B7280]">Loading...</div>
        ) : clients.length === 0 ? (
          <div className="px-6 py-8 text-sm text-[#6B7280]">No clients yet. Add your first client.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-[#6B7280] border-b border-gray-100">
                <th className="text-left py-3 px-6 font-medium">Name</th>
                <th className="text-left py-3 px-6 font-medium">Email</th>
                <th className="text-left py-3 px-6 font-medium">Phone</th>
                <th className="text-left py-3 px-6 font-medium">Created At</th>
                <th className="text-left py-3 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-[#1A1A2E]">{client.name}</td>
                  <td className="py-4 px-6 text-sm text-[#6B7280]">{client.email}</td>
                  <td className="py-4 px-6 text-sm text-[#6B7280]">{client.phone || '—'}</td>
                  <td className="py-4 px-6 text-sm text-[#6B7280]">{formatDate(client.created_at)}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal({ mode: 'edit', client })}
                        className="p-1.5 text-[#6B7280] hover:text-[#3B3FD8] hover:bg-[#E8E9FB] rounded-lg transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(client.id)}
                        className="p-1.5 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Create/Edit modal */}
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

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Delete Client" onClose={() => setDeleteId(null)}>
          <p className="text-sm text-[#6B7280] mb-4">Are you sure you want to delete this client? This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="danger" onClick={handleDelete} className="flex-1 justify-center">Delete</Button>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1 justify-center">Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
