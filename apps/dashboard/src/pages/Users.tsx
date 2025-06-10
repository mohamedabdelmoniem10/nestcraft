import React from 'react';
import { UserTable } from '@/components/users/UserTable';

export function Users() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage users, roles, and permissions for your CMS.
        </p>
      </div>

      <UserTable />
    </div>
  );
}