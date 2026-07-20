/**
 * All Users — requires GET /api/admin-api/users/
 *
 * Add to Django:
 *   # users/views.py
 *   class AdminUserListView(generics.ListAPIView):
 *       serializer_class = UserSerializer
 *       permission_classes = [permissions.IsAdminUser]
 *       queryset = User.objects.all().order_by('-date_joined')
 *
 *   # users/urls.py
 *   path("admin-api/users/", AdminUserListView.as_view()),
 */
import { useState, useEffect } from 'react'
import AdminNavBar from './AdminNavBar.jsx'
import { http } from '../../services/api.js'

async function fetchSafe(url) {
  try { const r = await http.get(url); return r.data } catch { return null }
}

export default function AdminUsers() {
  const [users,    setUsers]    = useState([])
  const [search,   setSearch]   = useState('')
  const [roleFilter, setRole]   = useState('all')
  const [loading,  setLoading]  = useState(true)
  const [noEndpoint, setNoEndpoint] = useState(false)

  useEffect(() => {
    fetchSafe('/admin-api/users/').then(data => {
      if (data) setUsers(data)
      else setNoEndpoint(true)
      setLoading(false)
    })
  }, [])

  const filtered = users.filter(u => {
    const matchRole   = roleFilter==='all' || u.role===roleFilter.toUpperCase()
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <div className="min-h-full">
      <AdminNavBar/>
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        <h2 className="font-display text-2xl font-bold mb-2 text-slate-900">All Users</h2>
        <p className="text-sm text-slate-400 mb-4">Platform-wide user directory.</p>

        {noEndpoint && (
          <div className="mb-5 p-4 rounded-xl text-sm"
            style={{ background:'#d9770611', color:'#d97706', border:'1px solid #d9770622' }}>
            Add <code>GET /api/admin-api/users/</code> to Django to see users here.
            See the comment at the top of this file for the exact code.
          </div>
        )}

        {!noEndpoint && (
          <>
            <div className="flex gap-3 mb-6 flex-wrap">
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white min-w-0"/>
              {['all','patient','doctor'].map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
                    roleFilter===r ? 'text-white' : 'bg-white border border-surface-200 text-slate-600 hover:bg-surface-50'
                  }`}
                  style={roleFilter===r ? { background:'#7c3aed' } : {}}>
                  {r}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mb-3">{filtered.length} user{filtered.length!==1?'s':''} found</p>
          </>
        )}

        {loading && <p className="text-slate-400 text-sm">Loading…</p>}

        {!loading && !noEndpoint && (
          <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  {['Name','Email','Role','Age','Phone'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u,i) => (
                  <tr key={u.id}
                    className="border-b border-surface-200 last:border-0 hover:bg-surface-50 transition animate-fade-in"
                    style={{ animationDelay:`${i*0.03}s` }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="tag text-xs"
                        style={{
                          background: u.role==='PATIENT'?'#2563eb22':'#05966922',
                          color:      u.role==='PATIENT'?'#2563eb':'#059669',
                        }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{u.age || '—'}</td>
                    <td className="px-5 py-3 text-slate-500">{u.phone || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0 && (
              <div className="text-center py-12 text-slate-400">No users found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
