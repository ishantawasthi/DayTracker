import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Settings,
  User,
  Clock,
  Tag,
  Plus,
  Trash2,
  Check,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { categoryApi } from '../api/categoryApi';

export const SettingsPage = () => {
  const { categories } = useOutletContext();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [jobStart, setJobStart] = useState(user?.jobSchedule?.start || '10:00');
  const [jobEnd, setJobEnd] = useState(user?.jobSchedule?.end || '19:00');
  const [profileSaved, setProfileSaved] = useState(false);

  // New category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1');
  const [catList, setCatList] = useState(categories);
  const [catError, setCatError] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name,
        jobSchedule: { start: jobStart, end: jobEnd }
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setCatError('');

    try {
      const res = await categoryApi.createCategory({
        name: newCatName.trim(),
        color: newCatColor
      });
      if (res.success) {
        setCatList([...catList, res.data]);
        setNewCatName('');
      }
    } catch (err) {
      setCatError(err.response?.data?.message || 'Error creating category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Associated tasks will be preserved.')) return;
    try {
      await categoryApi.deleteCategory(id);
      setCatList(catList.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>App Preferences & Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your daily schedule, life categories, and profile details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile & Work Hours */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Profile & Office Hours</h2>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full mt-1 text-xs px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Job Work Hours</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400">Office Starts</span>
                  <input
                    type="time"
                    value={jobStart}
                    onChange={(e) => setJobStart(e.target.value)}
                    className="w-full mt-0.5 text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Office Ends</span>
                  <input
                    type="time"
                    value={jobEnd}
                    onChange={(e) => setJobEnd(e.target.value)}
                    className="w-full mt-0.5 text-xs px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
            >
              {profileSaved ? <Check className="w-4 h-4" /> : null}
              <span>{profileSaved ? 'Profile Updated!' : 'Save Settings'}</span>
            </button>
          </form>
        </div>

        {/* Categories Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Tag className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Life Domains & Categories</h2>
          </div>

          {/* Add custom category */}
          <form onSubmit={handleCreateCategory} className="flex gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Add custom category..."
              className="flex-1 text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              className="w-9 h-8 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-white dark:bg-slate-800"
              title="Pick color"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
          {catError && <p className="text-[11px] text-rose-500">{catError}</p>}

          {/* Categories List */}
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {catList.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-medium text-slate-800 dark:text-slate-200">{cat.name}</span>
                  {cat.isSystem && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                      Core
                    </span>
                  )}
                </div>

                {!cat.isSystem && (
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PWA & Install Guidance Box */}
      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-3">
        <Smartphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">
            Install DayTrack on your Phone (PWA)
          </p>
          <p>
            Open DayTrack in Chrome / Safari on your mobile device, tap <strong>Share</strong> or the <strong>three dots menu</strong>, and select <strong>"Add to Home Screen"</strong> for instant full-screen app access with offline sync support.
          </p>
        </div>
      </div>
    </div>
  );
};
