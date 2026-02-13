import { Users } from 'lucide-react';

export default function Characters() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">角色库</h1>
        <p className="mt-1 text-sm text-gray-500">
          管理小说角色的人设图
        </p>
      </div>
      <div className="card text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">功能开发中</h3>
        <p className="mt-1 text-sm text-gray-500">
          角色库功能即将上线
        </p>
      </div>
    </div>
  );
}
