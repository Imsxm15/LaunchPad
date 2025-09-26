import { AmbientColor } from '@/components/decorations/ambient-color';
import { Login } from '@/components/login';

export default function LoginPage() {
  return (
    <div className="relative overflow-hidden">
      <AmbientColor />
      <Login />
    </div>
  );
}
