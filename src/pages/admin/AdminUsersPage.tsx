import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, CheckCircle2, XCircle, ShieldCheck, Mail, AlertCircle } from 'lucide-react';
import { AdminUser } from '../../types';
import { db, PRIMARY_ADMIN_EMAIL } from '../../lib/firebase';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';

export const AdminUsersPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<'super_admin' | 'admin' | 'editor'>('admin');
  const [newName, setNewName] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'admins'));
      const list: AdminUser[] = [];
      snap.forEach(d => {
        list.push({ uid: d.id, ...d.data() } as AdminUser);
      });

      // Ensure primary admin is always in list
      if (!list.some(a => a.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase())) {
        list.unshift({
          uid: 'super-admin-primary',
          email: PRIMARY_ADMIN_EMAIL,
          displayName: 'Primary System Administrator',
          isActive: true,
          role: 'super_admin',
          createdAt: new Date().toISOString()
        });
      }

      setAdmins(list);
    } catch {
      // Fallback list
      setAdmins([
        {
          uid: 'super-admin-primary',
          email: PRIMARY_ADMIN_EMAIL,
          displayName: 'Primary System Administrator',
          isActive: true,
          role: 'super_admin',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    const emailClean = newEmail.trim().toLowerCase();
    const id = `admin-${Date.now()}`;
    const newAdmin: AdminUser = {
      uid: id,
      email: emailClean,
      displayName: newName.trim() || emailClean.split('@')[0],
      isActive: true,
      role: newRole,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'admins', id), newAdmin);
      setAdmins(prev => [...prev, newAdmin]);
      setNewEmail('');
      setNewName('');
      setMessage(`Admin ${emailClean} added successfully.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(`Saved locally: ${err?.message || 'Permission updated'}`);
    }
  };

  const handleToggleActive = async (admin: AdminUser) => {
    if (admin.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      alert('Cannot deactivate primary super administrator.');
      return;
    }

    const updated = { ...admin, isActive: !admin.isActive };
    try {
      await setDoc(doc(db, 'admins', admin.uid), updated, { merge: true });
    } catch {
      // ignore
    }
    setAdmins(prev => prev.map(a => a.uid === admin.uid ? updated : a));
  };

  const handleDelete = async (admin: AdminUser) => {
    if (admin.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      alert('Cannot delete primary super administrator.');
      return;
    }

    if (window.confirm(`Remove admin privileges from ${admin.email}?`)) {
      try {
        await deleteDoc(doc(db, 'admins', admin.uid));
      } catch {
        // ignore
      }
      setAdmins(prev => prev.filter(a => a.uid !== admin.uid));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Administrator Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage authorized accounts, permissions, and roles. Primary admin: {PRIMARY_ADMIN_EMAIL}.
        </p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Add Admin Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
          <UserPlus className="w-4 h-4 text-red-800 dark:text-amber-400" />
          <span>Authorize New Administrator</span>
        </h2>

        <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Admin Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sub-Editor (Odia)"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              required
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Permission Role
            </label>
            <div className="flex space-x-2">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="admin">Administrator (Full Access)</option>
                <option value="editor">Editor (Upload & Edit)</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 bg-red-900 hover:bg-red-800 text-amber-300 font-bold text-xs rounded-lg shadow-xs transition shrink-0 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Admin Users List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
              <th className="py-3 px-4">Admin Email</th>
              <th className="py-3 px-3">Display Name</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {admins.map(admin => {
              const isPrimary = admin.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

              return (
                <tr key={admin.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{admin.email}</span>
                      {isPrimary && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-red-900 text-amber-300 font-bold">
                          PRIMARY
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                    {admin.displayName || '—'}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 uppercase text-[10px]">
                    {admin.role.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => handleToggleActive(admin)}
                      disabled={isPrimary}
                      className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        admin.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {admin.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{admin.isActive ? 'Active' : 'Disabled'}</span>
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!isPrimary && (
                      <button
                        onClick={() => handleDelete(admin)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded cursor-pointer"
                        title="Delete Admin"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
