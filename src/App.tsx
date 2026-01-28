import React, { useState } from 'react';
import { 
  Clock, 
  User, 
  Scissors, 
  CheckCircle, 
  LayoutDashboard, 
  Users, 
  Smartphone,
  ChevronRight,
  Calendar,
  LogOut,
  Package,    
  ShoppingBag, 
  Star,
  Trash2,    // Ícone Lixeira
  Plus,      // Ícone Adicionar
  Save,      // Ícone Salvar
} from 'lucide-react';

// ==========================================
// 1. DADOS E TIPOS
// ==========================================

type Category = 'cabelo' | 'barba' | 'pacote' | 'produto';

type Service = {
  id: number;
  name: string;
  price: number;
  duration: number; 
  description: string;
  category: Category;
};

type Professional = {
  id: number;
  name: string;
  avatar: string; 
  rating: number;
  workHours: string; // Novo: Horário de trabalho (ex: "09:00 - 18:00")
};

type Appointment = {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: number;
  professionalId: number; 
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
};

// --- DADOS INICIAIS (Agora serão carregados no Estado) ---

const INITIAL_PROFESSIONALS: Professional[] = [
  { id: 1, name: 'Mestre Navalha', avatar: 'MN', rating: 5.0, workHours: '09:00 - 19:00' },
  { id: 2, name: 'João Tesoura', avatar: 'JT', rating: 4.8, workHours: '10:00 - 20:00' },
  { id: 3, name: 'Ana Fade', avatar: 'AF', rating: 4.9, workHours: '09:00 - 18:00' },
  { id: 4, name: 'Folinha do Cipo', avatar: 'FC', rating: 4.9, workHours: '13:00 - 22:00' },
];

const INITIAL_SERVICES: Service[] = [
  // Cabelo
  { id: 1, name: 'Corte Degradê', price: 45.00, duration: 45, description: 'Corte moderno com acabamento na navalha.', category: 'cabelo' },
  { id: 2, name: 'Corte Social', price: 35.00, duration: 30, description: 'Clássico e alinhado.', category: 'cabelo' },
  { id: 3, name: 'Corte Com Tintura', price: 50.00, duration: 30, description: 'Clássico + pintura de coloração.', category: 'cabelo' },
  { id: 4, name: 'Corte Personalizado', price: 40.00, duration: 30, description: 'Corte a moda do cliente', category: 'cabelo' },
  { id: 5, name: 'Pezinho e Acabamento', price: 20.00, duration: 15, description: 'Apenas os contornos.', category: 'cabelo'},
  // Barba
  { id: 6, name: 'Barba Terapia', price: 35.00, duration: 30, description: 'Modelagem com toalha quente.', category: 'barba' },
  // Pacotes
  { id: 7, name: 'O Patriarca', price: 70.00, duration: 75, description: 'Corte + Barba + Sobrancelha.', category: 'pacote' },
  { id: 8, name: 'Dia de Noivo', price: 250.00, duration: 180, description: 'Completo + Massagem + Drinks.', category: 'pacote' },
  // Produtos
  { id: 9, name: 'Pomada Matte', price: 25.00, duration: 10, description: 'Alta fixação sem brilho.', category: 'produto' },
  { id: 10, name: 'Kit Barba Completo', price: 85.00, duration: 10, description: 'Balm, Tônico e Shampoo.', category: 'produto' },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { 
    id: '1', 
    clientName: 'Cliente Teste', 
    clientPhone: '000000000', 
    serviceId: 1, 
    professionalId: 1, 
    date: new Date().toISOString().split('T')[0], 
    time: '10:00', 
    status: 'confirmed' 
  },
];

// ==========================================
// 2. FUNÇÕES AUXILIARES
// ==========================================

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const generateTimeSlots = () => {
  const slots = [];
  for (let i = 9; i <= 21; i++) { // Estendi até as 21h
    slots.push(`${i < 10 ? '0' + i : i}:00`);
    slots.push(`${i < 10 ? '0' + i : i}:30`);
  }
  return slots;
};

const getNextDays = (days: number) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const formatDateToLocalString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================

export default function BarberShopApp() {
  const [viewMode, setViewMode] = useState<'client' | 'admin'>('client');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  // --- ESTADOS GLOBAIS (Onde os dados vivem) ---
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [services, setServices] = useState<Service[]>(INITIAL_SERVICES);
  const [professionals, setProfessionals] = useState<Professional[]>(INITIAL_PROFESSIONALS);
  
  // --- Estados do Cliente ---
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); 
  const [categoryFilter, setCategoryFilter] = useState<Category>('cabelo'); 
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientForm, setClientForm] = useState({ name: '', phone: '' });

  // --- Estados do Admin ---
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [adminTab, setAdminTab] = useState<'dashboard' | 'services' | 'team' | 'agenda'>('dashboard');
  
  // Formulários de Edição Admin
  const [newService, setNewService] = useState<Partial<Service>>({ category: 'cabelo' });
  const [newPro, setNewPro] = useState<Partial<Professional>>({ rating: 5.0 });

  // --- LÓGICA DE AGENDAMENTO ---

  const isSlotAvailable = (checkDate: string, checkTime: string, profId: number) => {
    // 1. Verifica conflito de agenda
    const isBusy = appointments.some(appt => 
      appt.date === checkDate && 
      appt.time === checkTime && 
      appt.professionalId === profId && 
      appt.status !== 'cancelled'
    );
    if (isBusy) return false;

    // 2. Verifica horário mínimo (15 min)
    const now = new Date();
    const todayStr = formatDateToLocalString(now);

    if (checkDate === todayStr) {
      const [slotHour, slotMinute] = checkTime.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(slotHour, slotMinute, 0, 0);
      const minTime = new Date(now.getTime() + 15 * 60000); 

      if (slotDate < minTime) return false; 
    }
    if (checkDate < todayStr) return false;

    return true; 
  };

  // --- HANDLERS CLIENTE ---

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2); 
  };

  const handleProfessionalSelect = (prof: Professional) => {
    setSelectedProfessional(prof);
    setStep(3); 
    setSelectedDate(formatDateToLocalString(new Date())); 
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedProfessional) return;

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      clientName: clientForm.name,
      clientPhone: clientForm.phone,
      serviceId: selectedService.id,
      professionalId: selectedProfessional.id,
      date: selectedDate,
      time: selectedTime,
      status: 'pending'
    };

    setAppointments([...appointments, newAppointment]);
    setStep(5);
  };

  // --- HANDLERS ADMIN ---

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // LOGIN: adm1 / 0000
    if (loginForm.user === 'adm1' && loginForm.pass === '0000') {
      setIsAdminLoggedIn(true);
      setLoginForm({ user: '', pass: '' }); // Limpa form
    } else {
      alert('Acesso Negado. Verifique suas credenciais.');
    }
  };

  const handleAddService = () => {
    if (!newService.name || !newService.price) return alert("Preencha nome e preço");
    const id = Date.now();
    setServices([...services, { ...newService, id } as Service]);
    setNewService({ category: 'cabelo', name: '', price: 0, duration: 30, description: '' }); // Reset
  };

  const handleDeleteService = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleAddPro = () => {
    if (!newPro.name) return alert("Nome é obrigatório");
    const id = Date.now();
    // Gera iniciais para o avatar
    const initials = newPro.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();
    setProfessionals([...professionals, { ...newPro, id, avatar: initials } as Professional]);
    setNewPro({ name: '', rating: 5.0, workHours: '09:00 - 18:00' });
  };

  const handleDeletePro = (id: number) => {
    if (confirm('Excluir profissional?')) {
      setProfessionals(professionals.filter(p => p.id !== id));
    }
  };

  // --- RENDERIZADORES ---

  const renderClientView = () => {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-900 pb-20 font-sans text-slate-200">
        {/* Header Cliente */}
        <header className="bg-slate-800 p-4 sticky top-0 z-10 shadow-lg border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider">BARBER<span className="text-cyan-400">SHOP</span></h1>
          </div>
          <button 
            onClick={() => setViewMode('admin')}
            className="text-xs font-bold text-slate-400 border border-slate-600 px-3 py-1 rounded-full hover:text-white transition"
          >
            Admin
          </button>
        </header>

        <main className="p-4">
          {/* Cliente Step 1: Serviços */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-4">Escolha o Serviço</h2>
              
              <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                {[
                  { id: 'cabelo', label: 'Cortes', icon: Scissors },
                  { id: 'barba', label: 'Barba', icon: User },
                  { id: 'pacote', label: 'Pacotes', icon: Package },
                  { id: 'produto', label: 'Produtos', icon: ShoppingBag },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id as Category)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all border ${
                      categoryFilter === cat.id 
                        ? 'bg-cyan-500 border-cyan-500 text-slate-900 font-bold shadow-lg shadow-cyan-500/20' 
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <cat.icon size={16} /> {cat.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {services.filter(s => s.category === categoryFilter).map(service => (
                  <button 
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="w-full bg-slate-800 p-4 rounded-xl text-left border border-slate-700 hover:border-cyan-500 transition group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400">{service.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-lg font-bold text-cyan-400">{formatCurrency(service.price)}</span>
                        {service.duration > 0 && (
                           <span className="text-xs text-slate-500 flex items-center justify-end mt-1">
                             <Clock size={12} className="mr-1" /> {service.duration} min
                           </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                {services.filter(s => s.category === categoryFilter).length === 0 && (
                   <p className="text-center text-slate-500 py-8">Nenhum serviço nesta categoria.</p>
                )}
              </div>
            </div>
          )}

          {/* Cliente Step 2: Profissionais */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button onClick={() => setStep(1)} className="text-sm text-slate-400 mb-4 flex items-center hover:text-white"><ChevronRight className="rotate-180 mr-1" size={16}/> Voltar</button>
              <h2 className="text-2xl font-bold text-white mb-2">Quem vai te atender?</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {professionals.map(prof => (
                  <button
                    key={prof.id}
                    onClick={() => handleProfessionalSelect(prof)}
                    className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-cyan-500 transition w-full text-left group"
                  >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center font-bold text-white text-lg shadow-inner group-hover:from-cyan-500 group-hover:to-cyan-600 transition shrink-0">
                      {prof.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-cyan-400 transition">{prof.name}</h3>
                      <div className="flex items-center text-yellow-400 text-sm mt-1">
                        <Star size={14} fill="currentColor" className="mr-1"/> {prof.rating}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cliente Step 3: Data e Hora */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button onClick={() => setStep(2)} className="text-sm text-slate-400 mb-4 flex items-center hover:text-white"><ChevronRight className="rotate-180 mr-1" size={16}/> Voltar</button>
              <h2 className="text-2xl font-bold text-white mb-6">Escolha o Horário</h2>

              <div className="flex overflow-x-auto pb-4 gap-3 mb-6 scrollbar-hide">
                {getNextDays(7).map((date, i) => {
                  const dateStr = formatDateToLocalString(date);
                  const isSelected = dateStr === selectedDate;
                  const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border transition-all ${isSelected ? 'bg-cyan-500 border-cyan-500 text-slate-900' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                    >
                      <span className="text-xs uppercase font-bold">{dayName}</span>
                      <span className="text-xl font-bold">{date.getDate()}</span>
                    </button>
                  )
                })}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {generateTimeSlots().map((time) => {
                  const available = isSlotAvailable(selectedDate, time, selectedProfessional?.id || 0);
                  return (
                    <button
                      key={time}
                      disabled={!available} 
                      onClick={() => { setSelectedTime(time); setStep(4); }}
                      className={`py-3 rounded-lg font-medium transition-all border 
                        ${!available 
                          ? 'bg-slate-800/40 text-slate-600 border-transparent cursor-not-allowed line-through decoration-slate-600' 
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-cyan-500 hover:text-slate-900 hover:font-bold hover:border-cyan-500' 
                        }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cliente Step 4: Confirmar */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <button onClick={() => setStep(3)} className="text-sm text-slate-400 mb-4 flex items-center hover:text-white"><ChevronRight className="rotate-180 mr-1" size={16}/> Voltar</button>
               <h2 className="text-2xl font-bold text-white mb-4">Confirmar</h2>
               
               <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-6 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-bl-full -mr-4 -mt-4"></div>
                 <div className="mb-4">
                    <span className="text-slate-400 text-xs uppercase tracking-wider">Profissional</span>
                    <div className="text-white font-bold text-lg flex items-center gap-2">{selectedProfessional?.name}</div>
                 </div>
                 <div className="flex justify-between mb-4 border-b border-slate-700 pb-4">
                    <div>
                      <span className="text-slate-400 text-xs uppercase tracking-wider">Serviço</span>
                      <div className="text-white font-medium">{selectedService?.name}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-xs uppercase tracking-wider">Valor</span>
                      <div className="text-cyan-400 font-bold">{formatCurrency(selectedService?.price || 0)}</div>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 text-slate-300 bg-slate-900/50 p-3 rounded-lg">
                    <Calendar size={18} className="text-cyan-500"/>
                    <span className="font-medium">{selectedDate.split('-').reverse().join('/')}</span>
                    <Clock size={18} className="text-cyan-500 ml-2"/>
                    <span className="font-medium">{selectedTime}</span>
                 </div>
               </div>

               <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <input required type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500" placeholder="Seu Nome" value={clientForm.name} onChange={e => setClientForm({...clientForm, name: e.target.value})} />
                  <input required type="tel" className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-cyan-500" placeholder="WhatsApp" value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone: e.target.value})} />
                  <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                    Confirmar Agendamento <CheckCircle size={20} />
                  </button>
               </form>
            </div>
          )}

          {/* Cliente Step 5: Sucesso */}
          {step === 5 && (
            <div className="text-center animate-in zoom-in duration-500 pt-10">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Tudo Certo!</h2>
              <p className="text-slate-400 mb-8 px-8">Agendamento realizado com sucesso.</p>
              <button 
                onClick={() => {
                   const message = `Olá! Confirmo meu agendamento: ${selectedService?.name} dia ${selectedDate.split('-').reverse().join('/')} às ${selectedTime}`;
                   window.open(`https://wa.me/55${clientForm.phone}?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="w-full bg-[#25D366] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#128C7E] transition flex items-center justify-center gap-2 mb-4"
              >
                <Smartphone size={20} /> Enviar no WhatsApp
              </button>
              <button onClick={() => setStep(1)} className="text-slate-400 text-sm hover:text-white">Novo Agendamento</button>
            </div>
          )}
        </main>
      </div>
    );
  };

  const renderAdminView = () => {
    // 1. TELA DE LOGIN
    if (!isAdminLoggedIn) {
       return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
             <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 w-full max-w-sm">
                <div className="text-center mb-8">
                   <h2 className="text-2xl font-bold text-white">Acesso Administrativo</h2>
                   <p className="text-slate-400 text-sm">Identifique-se para continuar</p>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                   <input 
                      type="text" placeholder="Usuário (adm1)" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                      value={loginForm.user}
                      onChange={e => setLoginForm({...loginForm, user: e.target.value})}
                   />
                   <input 
                      type="password" placeholder="Senha (0000)" 
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                      value={loginForm.pass}
                      onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
                   />
                   <button className="w-full bg-cyan-500 text-slate-900 font-bold py-3 rounded-lg hover:bg-cyan-400 transition">
                      Entrar
                   </button>
                </form>
                <button onClick={() => setViewMode('client')} className="w-full text-center text-slate-500 text-sm mt-6 hover:text-white">
                   Voltar ao início
                </button>
             </div>
          </div>
       );
    }

    // 2. PAINEL ADMIN
    return (
       <div className="min-h-screen bg-slate-900 text-white md:flex">
          {/* Sidebar */}
          <aside className="w-full md:w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
             <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white tracking-wider">ADMIN<span className="text-cyan-400">PANEL</span></h2>
             </div>
             <nav className="flex-1 p-4 space-y-2">
                <button onClick={() => setAdminTab('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${adminTab === 'dashboard' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                   <LayoutDashboard size={20} /> Dashboard
                </button>
                <button onClick={() => setAdminTab('services')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${adminTab === 'services' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                   <Scissors size={20} /> Serviços
                </button>
                <button onClick={() => setAdminTab('team')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${adminTab === 'team' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                   <Users size={20} /> Profissionais
                </button>
                <button onClick={() => setAdminTab('agenda')} className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${adminTab === 'agenda' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-white'}`}>
                   <Calendar size={20} /> Agenda Completa
                </button>
             </nav>
             <div className="p-4 border-t border-slate-700">
                <button onClick={() => { setIsAdminLoggedIn(false); setViewMode('client'); }} className="flex items-center gap-2 text-red-400 hover:text-red-300">
                   <LogOut size={18} /> Sair
                </button>
             </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="flex-1 p-6 overflow-y-auto">
             
             {/* DASHBOARD */}
             {adminTab === 'dashboard' && (
                <div className="animate-in fade-in">
                   <h2 className="text-2xl font-bold mb-6">Visão Geral</h2>
                   
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                         <h3 className="text-slate-400 text-sm mb-1">Total Agendamentos</h3>
                         <p className="text-3xl font-bold">{appointments.length}</p>
                      </div>
                      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                         <h3 className="text-slate-400 text-sm mb-1">Serviços Ativos</h3>
                         <p className="text-3xl font-bold">{services.length}</p>
                      </div>
                      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                         <h3 className="text-slate-400 text-sm mb-1">Equipe</h3>
                         <p className="text-3xl font-bold">{professionals.length}</p>
                      </div>
                   </div>

                   <h3 className="text-xl font-bold mb-4">Ranking de Atendimentos</h3>
                   <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                      {professionals.map(p => {
                         const count = appointments.filter(a => a.professionalId === p.id).length;
                         return (
                            <div key={p.id} className="flex items-center justify-between p-4 border-b border-slate-700 last:border-0">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">{p.avatar}</div>
                                  <span className="font-medium">{p.name}</span>
                               </div>
                               <div className="flex items-center gap-2">
                                  <span className="text-2xl font-bold text-cyan-400">{count}</span>
                                  <span className="text-xs text-slate-500">agendamentos</span>
                               </div>
                            </div>
                         )
                      })}
                   </div>
                </div>
             )}

             {/* GERENCIAR SERVIÇOS */}
             {adminTab === 'services' && (
                <div className="animate-in fade-in">
                   <h2 className="text-2xl font-bold mb-6">Gerenciar Serviços</h2>
                   
                   {/* Form Adicionar */}
                   <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-8">
                      <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Novo Serviço</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <input type="text" placeholder="Nome do Serviço" className="bg-slate-900 border border-slate-700 rounded p-2 text-white" 
                            value={newService.name || ''} onChange={e => setNewService({...newService, name: e.target.value})} />
                         <input type="number" placeholder="Preço (R$)" className="bg-slate-900 border border-slate-700 rounded p-2 text-white" 
                            value={newService.price || ''} onChange={e => setNewService({...newService, price: parseFloat(e.target.value)})} />
                         <select className="bg-slate-900 border border-slate-700 rounded p-2 text-white"
                            value={newService.category} onChange={e => setNewService({...newService, category: e.target.value as Category})}>
                            <option value="cabelo">Cabelo</option>
                            <option value="barba">Barba</option>
                            <option value="pacote">Pacote</option>
                            <option value="produto">Produto</option>
                         </select>
                         <input type="text" placeholder="Descrição curta" className="bg-slate-900 border border-slate-700 rounded p-2 text-white" 
                            value={newService.description || ''} onChange={e => setNewService({...newService, description: e.target.value})} />
                      </div>
                      <button onClick={handleAddService} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold transition flex items-center gap-2">
                         <Save size={18}/> Salvar Serviço
                      </button>
                   </div>

                   {/* Lista */}
                   <div className="space-y-2">
                      {services.map(s => (
                         <div key={s.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                            <div>
                               <h4 className="font-bold text-white">{s.name}</h4>
                               <p className="text-sm text-slate-400">{formatCurrency(s.price)} • {s.category}</p>
                            </div>
                            <button onClick={() => handleDeleteService(s.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={20}/></button>
                         </div>
                      ))}
                   </div>
                </div>
             )}

             {/* GERENCIAR PROFISSIONAIS */}
             {adminTab === 'team' && (
                <div className="animate-in fade-in">
                   <h2 className="text-2xl font-bold mb-6">Equipe & Horários</h2>
                   
                   {/* Form Adicionar */}
                   <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-8">
                      <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Novo Profissional</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                         <input type="text" placeholder="Nome Completo" className="bg-slate-900 border border-slate-700 rounded p-2 text-white" 
                            value={newPro.name || ''} onChange={e => setNewPro({...newPro, name: e.target.value})} />
                         <input type="text" placeholder="Horário (Ex: 09:00 - 18:00)" className="bg-slate-900 border border-slate-700 rounded p-2 text-white" 
                            value={newPro.workHours || ''} onChange={e => setNewPro({...newPro, workHours: e.target.value})} />
                      </div>
                      <button onClick={handleAddPro} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded font-bold transition flex items-center gap-2">
                         <Save size={18}/> Cadastrar Profissional
                      </button>
                   </div>

                   {/* Lista */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {professionals.map(p => (
                         <div key={p.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">{p.avatar}</div>
                               <div>
                                  <h4 className="font-bold text-white">{p.name}</h4>
                                  <p className="text-xs text-cyan-400 font-bold bg-cyan-900/30 px-2 py-0.5 rounded inline-block mt-1">{p.workHours}</p>
                               </div>
                            </div>
                            <button onClick={() => handleDeletePro(p.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={20}/></button>
                         </div>
                      ))}
                   </div>
                </div>
             )}
             
             {/* AGENDA COMPLETA */}
             {adminTab === 'agenda' && (
                <div className="animate-in fade-in">
                   <h2 className="text-2xl font-bold mb-6">Agenda Completa</h2>
                   <div className="space-y-2">
                      {appointments.length === 0 ? <p className="text-slate-500">Agenda vazia.</p> : 
                         appointments.map(a => {
                            const profName = professionals.find(p => p.id === a.professionalId)?.name || 'N/A';
                            const servName = services.find(s => s.id === a.serviceId)?.name || 'N/A';
                            return (
                               <div key={a.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-2">
                                  <div>
                                     <div className="font-bold text-white">{a.clientName} <span className="text-slate-500 text-sm font-normal">({a.clientPhone})</span></div>
                                     <div className="text-sm text-slate-400">{servName} com <span className="text-cyan-400">{profName}</span></div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <div className="text-right">
                                        <div className="font-bold text-white">{a.time}</div>
                                        <div className="text-xs text-slate-500">{a.date.split('-').reverse().join('/')}</div>
                                     </div>
                                     <div className={`w-3 h-3 rounded-full ${a.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                  </div>
                               </div>
                            )
                         })
                      }
                   </div>
                </div>
             )}

          </main>
       </div>
    );
  };

  return (
    <div className="font-sans antialiased text-slate-200 selection:bg-cyan-500/30">
      {viewMode === 'client' ? renderClientView() : renderAdminView()}
    </div>
  );
}