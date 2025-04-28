
import { LoginForm } from "@/components/login/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-whatsly-50 to-whatsly-100 p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-4">
          <span className="text-white font-bold text-lg">W</span>
        </div>
        <h1 className="text-3xl font-bold">Whatsly</h1>
        <p className="text-muted-foreground mt-2">Plataforma de atendimento via WhatsApp</p>
      </div>
      
      <div className="w-full max-w-sm animate-fade-in">
        <LoginForm />
      </div>
      
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>© 2025 Whatsly. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
