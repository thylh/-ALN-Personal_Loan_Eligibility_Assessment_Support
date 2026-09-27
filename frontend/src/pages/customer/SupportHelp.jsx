import React, { useState } from 'react';
import { 
  HelpCircle, Search, ChevronDown, ChevronUp, 
  MessageSquare, Phone, Mail, Clock, Send, 
  Bot, User, Sparkles, CheckCircle2, ShieldCheck
} from 'lucide-react';

const FAQS_DATA = [
  {
    category: 'eligibility',
    question: 'Tôi cần đáp ứng những điều kiện gì để được vay vốn tại LOMS?',
    answer: 'Khách hàng chỉ cần là công dân Việt Nam từ 18 đến 60 tuổi, có Căn cước công dân gắn chip còn hiệu lực, không có nợ xấu nhóm 3-5 trên hệ thống CIC, và có nguồn thu nhập ổn định từ lương hoặc kinh doanh tối thiểu từ 4.500.000 đ/tháng.'
  },
  {
    category: 'disbursement',
    question: 'Thời gian xét duyệt hồ sơ và giải ngân vào tài khoản mất bao lâu?',
    answer: 'Hệ thống AI tự động chấm điểm tín dụng chỉ mất 3 - 5 phút. Sau khi được duyệt và bạn hoàn tất ký hợp đồng điện tử bằng mã OTP, tiền sẽ được chuyển tự động vào tài khoản ngân hàng của bạn trong vòng 15 phút qua hệ thống liên ngân hàng Napas 247.'
  },
  {
    category: 'interest',
    question: 'Phương thức tính lãi "Dư nợ giảm dần" khác gì so với "Lãi phẳng / Gốc đều"?',
    answer: 'Phương thức Dư nợ giảm dần tính tiền lãi dựa trên số tiền nợ gốc thực tế còn lại của từng tháng. Càng về các tháng sau, tiền lãi bạn phải trả càng ít đi. Còn phương thức Gốc đều (Fixed EMI) chia đều số tiền phải trả bằng nhau mỗi tháng, giúp bạn dễ dàng lập kế hoạch chi tiêu cố định.'
  },
  {
    category: 'payment',
    question: 'Tôi có thể thanh toán trả nợ trước hạn (tất toán sớm) được không? Có bị phạt không?',
    answer: 'Hoàn toàn ĐƯỢC! LOMS khuyến khích khách hàng tất toán sớm khi có điều kiện tài chính. Chúng tôi áp dụng chính sách MIỄN PHÍ phạt tất toán trước hạn cho tất cả các gói vay từ kỳ thứ 3 trở đi.'
  },
  {
    category: 'payment',
    question: 'Làm thế nào để thanh toán trả góp hàng tháng qua VietQR hoặc Virtual Account?',
    answer: 'Bạn chỉ cần vào mục "Thanh toán", mở ứng dụng ngân hàng bất kỳ (Vietcombank, MB, Techcombank, VPBank...) và quét mã VietQR hiển thị trên màn hình. Số tiền và nội dung chuyển khoản đã được điền sẵn chính xác 100%, tiền sẽ được gạch nợ sau 3 giây.'
  },
  {
    category: 'security',
    question: 'Xác thực eKYC không nhận diện được thẻ CCCD hoặc khuôn mặt thì tôi phải làm sao?',
    answer: 'Vui lòng kiểm tra lại: (1) Chụp CCCD ở nơi đủ sáng, không bị lóa đèn flash; (2) Không che tay vào 4 góc hoặc thông tin trên thẻ; (3) Khi quét khuôn mặt, tháo kính râm và khẩu trang, nhìn thẳng vào camera và thực hiện theo đúng chỉ dẫn cử động.'
  }
];

const INITIAL_CHAT_MESSAGES = [
  {
    sender: 'bot',
    text: 'Xin chào! Tôi là Trợ lý ảo LOMS AI. Tôi có thể hỗ trợ gì cho bạn về hồ sơ vay, lãi suất hoặc phương thức thanh toán hôm nay?',
    time: 'Vừa xong'
  }
];

const SupportHelp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);

  const filteredFaqs = FAQS_DATA.filter((faq) => {
    if (selectedCategory !== 'ALL' && faq.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    }
    return true;
  });

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsBotTyping(true);

    // Simulated Smart AI Response
    setTimeout(() => {
      let botReply = 'Cảm ơn bạn đã đặt câu hỏi. Chuyên viên tư vấn của chúng tôi sẽ liên hệ lại hoặc bạn có thể gọi hotline 1900 8899 để được hỗ trợ tức thì.';
      const lower = text.toLowerCase();

      if (lower.includes('lãi suất') || lower.includes('bao nhiêu')) {
        botReply = 'Lãi suất vay tại LOMS chỉ từ 0.8% - 1.2%/tháng tính theo dư nợ giảm dần, minh bạch 100% không phí ẩn!';
      } else if (lower.includes('thời gian') || lower.includes('giải ngân') || lower.includes('bao lâu')) {
        botReply = 'Sau khi duyệt hồ sơ và ký hợp đồng OTP, tiền sẽ vào tài khoản ngân hàng của bạn chỉ trong 15 phút qua Napas 247!';
      } else if (lower.includes('thanh toán') || lower.includes('trả nợ') || lower.includes('vietqr')) {
        botReply = 'Bạn chỉ cần vào mục "Thanh toán", quét mã VietQR tự động hoặc chuyển khoản vào số Virtual Account MB Bank của bạn là được gạch nợ ngay lập tức.';
      } else if (lower.includes('tất toán') || lower.includes('trước hạn')) {
        botReply = 'LOMS hỗ trợ tất toán trước hạn mọi lúc và MIỄN PHÍ phạt tất toán từ tháng thứ 3 trở đi bạn nhé!';
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsBotTyping(false);
    }, 900);
  };

  return (
    <div className="max-w-5xl mx-auto py-2 sm:py-6 animate-in fade-in duration-500 space-y-10">
      
      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-4 shadow-xl">
        <span className="text-xs font-bold text-blue-300 uppercase tracking-widest block">
          Trung Tâm Trợ Giúp & Chăm Sóc Khách Hàng 24/7
        </span>
        <h1 className="text-2xl sm:text-4xl font-black">
          Chúng tôi có thể giúp gì cho bạn?
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Tra cứu nhanh câu trả lời cho các thắc mắc về hồ sơ vay, quy trình định danh eKYC và hướng dẫn thanh toán.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mt-4">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập câu hỏi, ví dụ: Lãi suất, Giải ngân, Cách thanh toán..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 text-sm font-medium shadow-lg outline-none focus:ring-4 focus:ring-blue-400/30 transition"
          />
        </div>
      </div>

      {/* Main Grid: FAQ Accordion (7 cols) + AI Chatbot Widget (5 cols) */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: FAQ Accordion (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            {[
              { id: 'ALL', label: 'Tất cả câu hỏi' },
              { id: 'eligibility', label: 'Điều kiện vay' },
              { id: 'disbursement', label: 'Giải ngân' },
              { id: 'interest', label: 'Lãi suất & Phí' },
              { id: 'payment', label: 'Thanh toán' },
              { id: 'security', label: 'Bảo mật & eKYC' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl transition ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Accordion FAQ Items */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="transition">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-slate-50/80 transition"
                  >
                    <span className="text-xs sm:text-sm font-bold text-slate-800">
                      {faq.question}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100/80 animate-in fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không tìm thấy câu hỏi phù hợp với từ khóa của bạn.
              </div>
            )}
          </div>

          {/* Contact Direct Hotlines */}
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-1">
              <Phone className="w-5 h-5 text-blue-600 mx-auto" />
              <span className="text-[10px] text-slate-400 font-bold block">Hotline 24/7</span>
              <strong className="text-xs text-slate-900 block font-mono">1900 8899</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-1">
              <Mail className="w-5 h-5 text-emerald-600 mx-auto" />
              <span className="text-[10px] text-slate-400 font-bold block">Email hỗ trợ</span>
              <strong className="text-xs text-slate-900 block font-mono">hotro@loms.vn</strong>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-center space-y-1">
              <Clock className="w-5 h-5 text-amber-600 mx-auto" />
              <span className="text-[10px] text-slate-400 font-bold block">Thời gian trực</span>
              <strong className="text-xs text-slate-900 block">24/7 Cả Lễ Tết</strong>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive AI Virtual Assistant Chatbot (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[580px]">
          
          {/* Chat Header */}
          <div className="p-4 px-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white relative">
                <Bot className="w-5 h-5" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute bottom-0 right-0 ring-2 ring-slate-900"></span>
              </div>
              <div>
                <h4 className="text-xs font-bold block">Trợ Lý Ảo LOMS AI</h4>
                <span className="text-[10px] text-emerald-400 font-semibold block">Đang trực tuyến 24/7</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-300">
              Phản hồi tức thì
            </span>
          </div>

          {/* Quick Question Chips */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto text-[11px] font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => handleSendMessage('Lãi suất vay là bao nhiêu?')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-full hover:bg-blue-50 hover:text-blue-600 flex-shrink-0 transition"
            >
              Lãi suất?
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Sau bao lâu thì giải ngân?')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-full hover:bg-blue-50 hover:text-blue-600 flex-shrink-0 transition"
            >
              Giải ngân bao lâu?
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Cách thanh toán qua VietQR?')}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-full hover:bg-blue-50 hover:text-blue-600 flex-shrink-0 transition"
            >
              Thanh toán VietQR?
            </button>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                }`}>
                  <p>{msg.text}</p>
                  <span className={`text-[9px] block text-right mt-1 ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isBotTyping && (
              <div className="flex gap-2 items-center text-xs text-slate-400">
                <Bot className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>Trợ lý AI đang phản hồi...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 input-human py-2 text-xs"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};

export default SupportHelp;
