const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const memoryStore = require('../store/memoryStore');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Socket Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'loms_secret_jwt_key_2026_super_secure');
        socket.user = decoded;
      }
      return next();
    } catch (err) {
      console.warn('[Socket Auth Warning]: Connection without valid JWT, proceeding as guest listener.');
      return next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    const userId = user?.id || `guest_${socket.id.slice(0, 6)}`;
    const role = user?.role || 'guest';
    const userName = user?.fullName || 'Khách vãng lai';

    console.log(`[Socket Connected] Socket ID: ${socket.id} | User: ${userName} (${userId}) | Role: ${role}`);

    // Automatically join user-specific and role-specific channels
    if (user?.id) {
      socket.join(`user:${user.id}`);
      socket.join(`role:${role}`);
    }

    // Inform role room about active agent presence
    io.to(`role:${role}`).emit('presence:online', {
      userId,
      userName,
      role,
      socketId: socket.id,
      timestamp: new Date().toISOString()
    });

    // 1. Join Application Realtime Room (Collaboration & Co-Browsing)
    socket.on('loan:join_room', ({ loanId }) => {
      if (!loanId) return;
      const room = `loan:${loanId}`;
      socket.join(room);
      console.log(`[Socket Room] ${userName} (${role}) joined ${room}`);

      socket.to(room).emit('loan:actor_joined', {
        loanId,
        actorId: userId,
        actorName: userName,
        actorRole: role,
        timestamp: new Date().toISOString()
      });
    });

    // 2. Leave Application Room
    socket.on('loan:leave_room', ({ loanId }) => {
      if (!loanId) return;
      const room = `loan:${loanId}`;
      socket.leave(room);
      console.log(`[Socket Room] ${userName} left ${room}`);

      socket.to(room).emit('loan:actor_left', {
        loanId,
        actorId: userId,
        actorName: userName,
        timestamp: new Date().toISOString()
      });
    });

    // 3. Realtime Form Field Sync / Co-Browsing while entering application
    // When applicant or officer modifies an input field, it synchronizes live
    socket.on('loan:form_field_change', ({ loanId, fieldName, fieldValue, step }) => {
      if (!loanId) return;
      socket.to(`loan:${loanId}`).emit('loan:form_field_updated', {
        loanId,
        fieldName,
        fieldValue,
        step,
        modifiedBy: {
          id: userId,
          name: userName,
          role
        },
        timestamp: new Date().toISOString()
      });
    });

    // 4. Realtime Draft Auto-Save
    socket.on('loan:save_draft', (draftData, callback) => {
      try {
        if (!user?.id) {
          if (callback) callback({ success: false, message: 'Cần đăng nhập để lưu nháp.' });
          return;
        }

        const savedDraft = memoryStore.saveDraft(user.id, draftData);

        // Echo back to customer's other tabs or devices
        socket.to(`user:${user.id}`).emit('loan:draft_synced_remote', {
          draft: savedDraft,
          updatedAt: savedDraft.updatedAt
        });

        if (callback) {
          callback({
            success: true,
            message: 'Đã đồng bộ và lưu bản nháp theo thời gian thực.',
            data: savedDraft
          });
        }
      } catch (err) {
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // 5. Realtime Interaction / Comment / Q&A between Customer and Credit Officer
    socket.on('loan:send_comment', ({ loanId, content, attachments }, callback) => {
      try {
        if (!loanId || !content) {
          if (callback) callback({ success: false, message: 'Dữ liệu không đầy đủ.' });
          return;
        }

        const newComment = memoryStore.addComment(loanId, {
          senderId: userId,
          senderName: userName,
          senderRole: role,
          content,
          attachments: attachments || []
        });

        // Add to audit trail if it's an official loan
        const app = memoryStore.getApplicationById(loanId);
        if (app) {
          memoryStore.addAuditLog(loanId, {
            action: 'Trao đổi tương tác hồ sơ',
            performedBy: userName,
            role,
            actorType: role === 'customer' ? 'CUSTOMER' : 'CREDIT_OFFICER',
            note: content.length > 80 ? `${content.substring(0, 80)}...` : content
          });
        }

        // Broadcast to all participants in this loan's room
        io.to(`loan:${loanId}`).emit('loan:comment_received', {
          loanId,
          comment: newComment
        });

        // Also notify direct recipient if known
        if (role === 'credit_officer' && app?.customerId) {
          io.to(`user:${app.customerId}`).emit('notification:new', {
            title: `Phản hồi mới từ Chuyên viên thẩm định`,
            message: `Hồ sơ ${app.applicationNo}: "${content}"`,
            loanId: app._id,
            timestamp: new Date().toISOString()
          });
        } else if (role === 'customer' && app) {
          io.to('role:credit_officer').emit('notification:new', {
            title: `Khách hàng gửi tin nhắn mới`,
            message: `Hồ sơ ${app.applicationNo} (${userName}): "${content}"`,
            loanId: app._id,
            timestamp: new Date().toISOString()
          });
        }

        if (callback) callback({ success: true, data: newComment });
      } catch (err) {
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // 6. Typing indicator
    socket.on('loan:typing', ({ loanId, isTyping }) => {
      if (!loanId) return;
      socket.to(`loan:${loanId}`).emit('loan:actor_typing', {
        loanId,
        actorId: userId,
        actorName: userName,
        isTyping
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected] ${userName} (${socket.id})`);
      io.to(`role:${role}`).emit('presence:offline', {
        userId,
        timestamp: new Date().toISOString()
      });
    });
  });

  return io;
};

const getIo = () => io;

// Realtime Broadcast Helpers for Controllers and Services
const broadcastNewApplication = (application) => {
  if (!io) return;
  // Notify all credit officers and admins immediately
  io.to('role:credit_officer').to('role:admin').emit('loan:new_application', {
    application,
    message: `Hồ sơ mới ${application.applicationNo} từ khách hàng ${application.customerName} đã được nộp!`,
    timestamp: new Date().toISOString()
  });

  // Notify customer's other tabs
  io.to(`user:${application.customerId}`).emit('loan:status_updated', {
    loanId: application._id,
    application,
    status: application.status
  });
};

const broadcastApplicationStatusChange = (application, actionType, actor) => {
  if (!io) return;
  // Emit to application room and customer room
  io.to(`loan:${application._id}`).to(`user:${application.customerId}`).emit('loan:status_updated', {
    loanId: application._id,
    applicationNo: application.applicationNo,
    status: application.status,
    actionType,
    updatedBy: actor,
    application,
    timestamp: new Date().toISOString()
  });

  // Notify credit officers & admins to update their live table
  io.to('role:credit_officer').to('role:admin').emit('loan:table_row_updated', {
    loanId: application._id,
    application
  });
};

const broadcastSupplementRequest = (application, reason, requestedBy) => {
  if (!io) return;
  const payload = {
    loanId: application._id,
    applicationNo: application.applicationNo,
    status: 'ACTION_REQUIRED',
    reason,
    requestedBy,
    timestamp: new Date().toISOString()
  };

  io.to(`loan:${application._id}`).to(`user:${application.customerId}`).emit('loan:supplement_requested', payload);
  io.to(`user:${application.customerId}`).emit('notification:new', {
    title: 'Yêu cầu bổ sung chứng từ',
    message: `Hồ sơ ${application.applicationNo}: ${reason}`,
    loanId: application._id,
    timestamp: new Date().toISOString()
  });
};

const broadcastAppraisalDecision = (application, decision, officer) => {
  if (!io) return;
  const isApproved = decision === 'APPROVE';
  const payload = {
    loanId: application._id,
    applicationNo: application.applicationNo,
    decision,
    status: application.status,
    approvedAmount: application.approvedAmount,
    appraisalNote: application.appraisalNote,
    officerName: officer.fullName || 'Chuyên viên thẩm định',
    timestamp: new Date().toISOString()
  };

  io.to(`loan:${application._id}`).to(`user:${application.customerId}`).emit('loan:decision_received', payload);
  io.to(`user:${application.customerId}`).emit('notification:new', {
    title: isApproved ? 'Hồ sơ vay đã được PHÊ DUYỆT! 🎉' : 'Kết quả thẩm định hồ sơ',
    message: isApproved 
      ? `Hồ sơ ${application.applicationNo} được duyệt với số tiền ${application.approvedAmount?.toLocaleString('vi-VN')} VNĐ.`
      : `Hồ sơ ${application.applicationNo} đã bị từ chối: ${application.appraisalNote || 'Không đạt điều kiện'}`,
    loanId: application._id,
    timestamp: new Date().toISOString()
  });
};

const broadcastDashboardStats = (stats) => {
  if (!io) return;
  io.to('role:admin').to('role:credit_officer').emit('dashboard:stats_updated', stats);
};

// CDC / Event-Driven Sync Broadcast with Versioning & Envelope
const broadcastDocumentSync = (envelope) => {
  if (!io) return;
  const { documentId, payload } = envelope;

  // 1. Emit to specific document room for active viewers (co-browsing)
  io.to(`loan:${documentId}`).emit('document:sync', envelope);

  // 2. Emit to application owner (borrower)
  if (payload?.customerId) {
    io.to(`user:${payload.customerId}`).emit('document:sync', envelope);
  }

  // 3. Emit to all internal credit officers and admins
  io.to('role:credit_officer').to('role:admin').emit('document:sync', envelope);
  io.to('role:credit_officer').to('role:admin').emit('loan:table_row_updated', {
    loanId: documentId,
    application: payload
  });
};

module.exports = {
  initSocket,
  getIo,
  broadcastNewApplication,
  broadcastApplicationStatusChange,
  broadcastSupplementRequest,
  broadcastAppraisalDecision,
  broadcastDashboardStats,
  broadcastDocumentSync
};
