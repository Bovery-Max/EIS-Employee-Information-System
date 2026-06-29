'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import { useLanguage } from '../../../context/LanguageContext';
import CustomSelect from '../../../components/CustomSelect';

interface OrgNode {
  id: string;
  role: string;
  name: string;
  department: 'Management' | 'Engineering' | 'HR' | 'Other';
  children?: OrgNode[];
}

const initialTree: OrgNode = {
  id: '1',
  role: 'CEO',
  name: 'John Doe',
  department: 'Management',
  children: [
    {
      id: '2',
      role: 'Engineering Manager',
      name: 'Alice Smith',
      department: 'Engineering',
      children: [
        {
          id: '3',
          role: 'Developer 1',
          name: 'Bob Johnson',
          department: 'Engineering'
        },
        {
          id: '4',
          role: 'Developer 2',
          name: 'Charlie Brown',
          department: 'Engineering'
        }
      ]
    },
    {
      id: '5',
      role: 'HR Manager',
      name: 'Diana Prince',
      department: 'HR',
      children: [
        {
          id: '6',
          role: 'HR Specialist',
          name: 'Eva Green',
          department: 'HR'
        }
      ]
    }
  ]
};

// Recursive helpers for tree operations
const addNodeRecursive = (currentNode: OrgNode, parentId: string, newNode: OrgNode): OrgNode => {
  if (currentNode.id === parentId) {
    return {
      ...currentNode,
      children: [...(currentNode.children || []), newNode]
    };
  }
  if (currentNode.children) {
    return {
      ...currentNode,
      children: currentNode.children.map(child => addNodeRecursive(child, parentId, newNode))
    };
  }
  return currentNode;
};

const updateNodeRecursive = (currentNode: OrgNode, nodeId: string, updatedFields: Partial<OrgNode>): OrgNode => {
  if (currentNode.id === nodeId) {
    return {
      ...currentNode,
      ...updatedFields
    };
  }
  if (currentNode.children) {
    return {
      ...currentNode,
      children: currentNode.children.map(child => updateNodeRecursive(child, nodeId, updatedFields))
    };
  }
  return currentNode;
};

const deleteNodeRecursive = (currentNode: OrgNode, nodeId: string): OrgNode | null => {
  if (currentNode.id === nodeId) {
    return null;
  }
  if (currentNode.children) {
    const targetIndex = currentNode.children.findIndex(c => c.id === nodeId);
    if (targetIndex !== -1) {
      const targetNode = currentNode.children[targetIndex];
      const newChildren = [
        ...currentNode.children.slice(0, targetIndex),
        ...currentNode.children.slice(targetIndex + 1),
        ...(targetNode.children || [])
      ];
      return {
        ...currentNode,
        children: newChildren
      };
    }

    const updatedChildren = currentNode.children
      .map(child => deleteNodeRecursive(child, nodeId))
      .filter((child): child is OrgNode => child !== null);
    
    return {
      ...currentNode,
      children: updatedChildren
    };
  }
  return currentNode;
};

const flattenTree = (node: OrgNode): { id: string; role: string; name: string }[] => {
  const result = [{ id: node.id, role: node.role, name: node.name }];
  if (node.children) {
    node.children.forEach(child => {
      result.push(...flattenTree(child));
    });
  }
  return result;
};

const getNodeRecursive = (currentNode: OrgNode, nodeId: string): OrgNode | null => {
  if (currentNode.id === nodeId) return currentNode;
  if (currentNode.children) {
    for (const child of currentNode.children) {
      const found = getNodeRecursive(child, nodeId);
      if (found) return found;
    }
  }
  return null;
};

const getParentNodeRecursive = (currentNode: OrgNode, targetId: string): OrgNode | null => {
  if (currentNode.children?.some(c => c.id === targetId)) return currentNode;
  if (currentNode.children) {
    for (const child of currentNode.children) {
      const parent = getParentNodeRecursive(child, targetId);
      if (parent) return parent;
    }
  }
  return null;
};

const isDescendant = (nodeId: string, potentialDescendantId: string, tree: OrgNode): boolean => {
  const node = getNodeRecursive(tree, nodeId);
  if (!node) return false;
  return getNodeRecursive(node, potentialDescendantId) !== null;
};

export default function OrganizationPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [role, setRole] = useState<string | null>(null);
  
  // Tree state initialized from localStorage if available
  const [tree, setTree] = useState<OrgNode>(initialTree);
  const [loaded, setLoaded] = useState(false);

  // Modal State
  const [modal, setModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    parentNodeId: string;
    currentNodeId: string;
    role: string;
    name: string;
    department: 'Management' | 'Engineering' | 'HR' | 'Other';
  }>({
    isOpen: false,
    mode: 'add',
    parentNodeId: '1',
    currentNodeId: '',
    role: '',
    name: '',
    department: 'Engineering'
  });

  useEffect(() => {
    const stored = localStorage.getItem('eis_role');
    if (!stored) {
      router.push('/login');
    } else {
      setRole(stored);
    }
  }, [router]);

  // Load tree from local storage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eis_org_tree');
      if (saved) {
        try {
          setTree(JSON.parse(saved));
        } catch (e) {
          console.error('Error loading saved organization tree', e);
        }
      }
      setLoaded(true);
    }
  }, []);

  // Save tree to local storage when changed
  useEffect(() => {
    if (loaded && typeof window !== 'undefined') {
      localStorage.setItem('eis_org_tree', JSON.stringify(tree));
    }
  }, [tree, loaded]);

  if (!role) return null;

  const handleOpenAddModal = (parentId: string) => {
    setModal({
      isOpen: true,
      mode: 'add',
      parentNodeId: parentId,
      currentNodeId: '',
      role: '',
      name: '',
      department: 'Engineering'
    });
  };

  const handleOpenEditModal = (node: OrgNode) => {
    const parent = getParentNodeRecursive(tree, node.id);
    setModal({
      isOpen: true,
      mode: 'edit',
      parentNodeId: parent ? parent.id : '',
      currentNodeId: node.id,
      role: node.role,
      name: node.name,
      department: node.department
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === '1') return; // Cannot delete root
    if (confirm('Are you sure you want to delete this position? Its subordinates will be moved to the parent position.')) {
      setTree(prev => {
        const updated = deleteNodeRecursive(prev, nodeId);
        return updated || prev;
      });
    }
  };

  const handleSaveNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.role.trim() || !modal.name.trim()) return;

    if (modal.mode === 'add') {
      const newNode: OrgNode = {
        id: Date.now().toString(),
        role: modal.role,
        name: modal.name,
        department: modal.department,
        children: []
      };
      setTree(prev => addNodeRecursive(prev, modal.parentNodeId, newNode));
    } else {
      setTree(prev => {
        // If parent hasn't changed, just update fields
        const currentParent = getParentNodeRecursive(prev, modal.currentNodeId);
        if (!currentParent || currentParent.id === modal.parentNodeId) {
          return updateNodeRecursive(prev, modal.currentNodeId, {
            role: modal.role,
            name: modal.name,
            department: modal.department
          });
        }

        // Parent changed: prevent circular dependency
        if (isDescendant(modal.currentNodeId, modal.parentNodeId, prev)) {
          alert('Cannot move a position under its own subordinate.');
          return prev;
        }

        const nodeToMove = getNodeRecursive(prev, modal.currentNodeId);
        if (!nodeToMove) return prev;

        const updatedNode = { ...nodeToMove, role: modal.role, name: modal.name, department: modal.department };
        const treeWithoutNode = deleteNodeRecursive(prev, modal.currentNodeId);
        
        if (treeWithoutNode) {
          return addNodeRecursive(treeWithoutNode, modal.parentNodeId, updatedNode);
        }
        return prev;
      });
    }

    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleResetTree = () => {
    if (confirm('Are you sure you want to reset the organization chart to its default state?')) {
      setTree(initialTree);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const allPositions = flattenTree(tree);

  // Recursive render component for UI tree nodes
  const renderNode = (node: OrgNode) => {
    const initials = getInitials(node.name);
    return (
      <li key={node.id}>
        <div className="org-node-card">
          <div className={`org-avatar avatar-${node.department.toLowerCase()}`}>
            {initials}
          </div>
          <div className="org-node-role">{t('organization', node.role as any) || node.role}</div>
          <div className="org-node-name">{node.name}</div>
          <div className={`org-node-dept-tag dept-${node.department.toLowerCase()}`}>
            {t('organization', node.department === 'HR' ? 'hrDept' : node.department.toLowerCase() as any) || node.department}
          </div>
          
          <div className="org-node-actions">
            <button 
              className="org-action-btn add" 
              title="Add Subordinate"
              onClick={() => handleOpenAddModal(node.id)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button 
              className="org-action-btn edit" 
              title="Edit Position"
              onClick={() => handleOpenEditModal(node)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            {node.id !== '1' && (
              <button 
                className="org-action-btn delete" 
                title="Remove Position"
                onClick={() => handleDeleteNode(node.id)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {node.children && node.children.length > 0 && (
          <ul>
            {node.children.map(child => renderNode(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role={role} currentPath={pathname} />
      
      {/* Injected Premium CSS Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .dark {
          --bg-card: #1e293b;
          --bg-body: #0f172a;
          --border-color: #334155;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --bg-hover: rgba(59, 130, 246, 0.15);
          --bg-input: #1e293b;
        }
        .dark .users-table-wrapper, .dark .modal-content, .dark .org-container, .dark .leave-card, .dark .history-container, .dark .notification-card {
          background-color: var(--bg-card);
          border-color: var(--border-color);
        }
        .dark .users-table th, .dark .history-table th, .dark .table-header-container {
          background-color: var(--bg-hover);
          color: var(--text-muted);
          border-color: var(--border-color);
        }
        .dark .users-table tr, .dark .history-table tr {
          border-color: var(--border-color);
        }
        .dark .users-table tbody tr:hover, .dark .history-table tbody tr:hover {
          background-color: var(--bg-hover);
        }
        .dark .users-table td, .dark .history-table td {
          color: var(--text-main);
        }
        .dark input, .dark select, .dark textarea {
          background-color: var(--bg-input);
          color: var(--text-main);
          border-color: var(--border-color);
        }
        .dark .user-name, .dark .modal-header, .dark h2 {
          color: var(--text-main);
        }
        .dark .search-input {
          background-color: var(--bg-input);
          color: var(--text-main);
          border-color: var(--border-color);
        }
        .dark {
          --org-line: #475569;
          --org-bg: #0f172a;
        }
        .dark .org-node-card {
          background-color: var(--bg-input);
          border-color: var(--border-color);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
        }
        .dark .org-node-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
        }
        .dark .org-node-role {
          color: var(--text-main);
        }
        .dark .org-node-name {
          color: var(--text-muted);
        }
    
        .org-tree-wrapper {
          background-color: var(--bg-card, #ffffff);
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          width: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .org-tree-controls {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .org-tree-scroll-container {
          overflow-x: auto;
          overflow-y: auto;
          padding: 32px 24px;
          background-color: var(--org-bg, #f8fafc);
          border-radius: 10px;
          border: 1px dashed var(--border-color, #e2e8f0);
          min-height: 550px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          transition: all 0.3s ease;
        }

        .org-tree {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .org-tree ul {
          padding-top: 32px;
          position: relative;
          transition: all 0.3s ease;
          display: flex;
          justify-content: center;
          margin: 0;
          padding-left: 0;
        }

        .org-tree li {
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 32px 16px 0 16px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Connectors using ::before and ::after */
        .org-tree li::before, .org-tree li::after {
          content: '';
          position: absolute;
          top: 0;
          right: 50%;
          border-top: 2px solid var(--org-line, #cbd5e1);
          width: 50%;
          height: 32px;
          z-index: 1;
        }

        .org-tree li::after {
          right: auto;
          left: 50%;
          border-left: 2px solid var(--org-line, #cbd5e1);
        }

        /* Remove left-right connectors for single children */
        .org-tree li:only-child::after, .org-tree li:only-child::before {
          display: none;
        }

        .org-tree li:only-child {
          padding-top: 0;
        }

        .org-tree li:first-child::before, .org-tree li:last-child::after {
          border: 0 none;
        }

        .org-tree li:last-child::before {
          border-right: 2px solid var(--org-line, #cbd5e1);
          border-radius: 0 8px 0 0;
        }

        .org-tree li:first-child::after {
          border-radius: 8px 0 0 0;
        }

        /* Downward connectors from parent */
        .org-tree ul::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 2px solid var(--org-line, #cbd5e1);
          width: 0;
          height: 32px;
          z-index: 1;
        }

        /* Card Styling */
        .org-node-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px 16px;
          width: 210px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          position: relative;
          z-index: 2;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .org-node-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
          border-color: #3b82f6;
        }

        .org-avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          margin-bottom: 10px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .avatar-management {
          background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
          color: #4f46e5;
          border: 2px solid #4f46e5;
        }

        .avatar-engineering {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #2563eb;
          border: 2px solid #2563eb;
        }

        .avatar-hr {
          background: linear-gradient(135deg, #fce7f3, #fbcfe8);
          color: #db2777;
          border: 2px solid #db2777;
        }

        .avatar-other {
          background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
          color: #475569;
          border: 2px solid #475569;
        }

        .org-node-role {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .org-node-name {
          font-size: 12px;
          color: #64748b;
          text-align: center;
          font-weight: 500;
          margin-bottom: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .org-node-dept-tag {
          font-size: 9px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dept-management {
          background-color: #e0e7ff;
          color: #4f46e5;
        }

        .dept-engineering {
          background-color: #dbeafe;
          color: #2563eb;
        }

        .dept-hr {
          background-color: #fce7f3;
          color: #db2777;
        }

        .dept-other {
          background-color: #f1f5f9;
          color: #475569;
        }

        /* Action buttons */
        .org-node-actions {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          opacity: 0;
          transform: translateY(5px);
          transition: all 0.2s ease;
        }

        .org-node-card:hover .org-node-actions {
          opacity: 1;
          transform: translateY(0);
        }

        .org-action-btn {
          border: none;
          background: #f8fafc;
          color: #64748b;
          border-radius: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .org-action-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .org-action-btn.add:hover {
          background: #dbeafe;
          color: #2563eb;
        }

        .org-action-btn.edit:hover {
          background: #fef9c3;
          color: #a16207;
        }

        .org-action-btn.delete:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          background: var(--bg-card, #ffffff);
          border-radius: 16px;
          padding: 28px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .modal-header {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 18px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }

        .form-group input, .form-group select {
          padding: 10px 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .form-group input:focus, .form-group select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 28px;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #475569;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-secondary:hover {
          background: #e2e8f0;
        }

        .btn-primary {
          background: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      ` }} />

      <main className="flex-1 p-8 text-slate-900 dark:text-slate-100">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ color: "inherit", margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{t('organization', 'title')}</h2>
            <p style={{ color: "var(--text-muted, #64748b)", margin: '4px 0 0 0', fontSize: '14px' }}>
              {t('organization', 'description')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={handleResetTree}
              style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              {t('organization', 'resetTree')}
            </button>
            {role === 'ADMIN' && (
              <button 
                onClick={() => handleOpenAddModal('1')}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              >
                + {t('organization', 'addNode')}
              </button>
            )}
          </div>
        </div>

        <div className="org-tree-wrapper">
          <div className="org-tree-scroll-container">
            <div className="org-tree">
              <ul>
                {renderNode(tree)}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Modal for Adding/Editing Nodes */}
      {modal.isOpen && (
        <div className="modal-overlay" onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              {modal.mode === 'add' ? t('organization', 'addPositionTitle') : t('organization', 'editPositionTitle')}
            </div>
            
            <form onSubmit={handleSaveNode}>
              {(modal.mode === 'add' || modal.currentNodeId !== '1') && (
                <div className="form-group">
                  <label htmlFor="reportsTo">{t('organization', 'reportsTo')}</label>
                  <CustomSelect
                    id="reportsTo"
                    value={modal.parentNodeId}
                    onChange={val => setModal(prev => ({ ...prev, parentNodeId: val }))}
                    options={allPositions
                      // Prevent moving node under itself or its descendants
                      .filter(pos => !(modal.mode === 'edit' && (pos.id === modal.currentNodeId || isDescendant(modal.currentNodeId, pos.id, tree))))
                      .map(pos => ({
                        value: pos.id,
                        label: `${t('organization', pos.role as any) || pos.role} (${pos.name})`
                      }))}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="roleTitle">{t('organization', 'roleTitle')}</label>
                <input
                  id="roleTitle"
                  type="text"
                  placeholder={t('organization', 'roleTitlePlaceholder')}
                  value={modal.role}
                  onChange={e => setModal(prev => ({ ...prev, role: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="fullName">{t('organization', 'modalFullName')}</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder={t('organization', 'modalFullNamePlaceholder')}
                  value={modal.name}
                  onChange={e => setModal(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">{t('organization', 'modalDepartment')}</label>
                <CustomSelect
                  id="department"
                  value={modal.department}
                  onChange={val => setModal(prev => ({ ...prev, department: val as any }))}
                  options={[
                    { value: 'Management', label: t('organization', 'management') || 'Management' },
                    { value: 'Engineering', label: t('organization', 'engineering') || 'Engineering' },
                    { value: 'HR', label: t('organization', 'hrDept') || 'HR' },
                    { value: 'Other', label: t('organization', 'other') || 'Other' }
                  ]}
                />
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                >
                  {t('organization', 'cancel')}
                </button>
                <button type="submit" className="btn-primary">
                  {t('organization', 'save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
