/**
 * Tiện ích chuyển đổi 2 chiều và thẩm tra đồ thị quyết định (AST) cho Rule Engine R5.2
 */

/**
 * transformDBToFlow:
 * Nhận cấu trúc cấu hình dạng bảng/DB và ánh xạ thành nodes & edges để render lên React Flow Canvas
 */
export function transformDBToFlow(dbRules = []) {
  // Nếu có sẵn decisionFlow đã lưu từ trước thì khôi phục lại
  if (dbRules && dbRules.nodes && dbRules.edges) {
    return {
      nodes: dbRules.nodes,
      edges: dbRules.edges
    };
  }

  // Khởi tạo luồng mặc định chuẩn Fintech cho hệ thống
  const defaultNodes = [
    {
      id: 'node-start',
      type: 'startNode',
      position: { x: 350, y: 30 },
      data: { label: 'Hồ sơ vay nộp thành công' }
    },
    {
      id: 'cond-ekyc',
      type: 'decisionNode',
      position: { x: 310, y: 150 },
      data: {
        label: 'Xác thực khuôn mặt eKYC',
        field: 'faceMatchScore',
        operator: '>=',
        value: '80%'
      }
    },
    {
      id: 'cond-cic',
      type: 'decisionNode',
      position: { x: 180, y: 330 },
      data: {
        label: 'Tra cứu nợ xấu CIC',
        field: 'cicDebtGroup',
        operator: '<=',
        value: 'Nhóm 2'
      }
    },
    {
      id: 'cond-dti',
      type: 'decisionNode',
      position: { x: 80, y: 510 },
      data: {
        label: 'Tỷ lệ gánh nợ DTI',
        field: 'dtiRatio',
        operator: '<=',
        value: '50%'
      }
    },
    {
      id: 'act-reject-ekyc',
      type: 'actionNode',
      position: { x: 550, y: 330 },
      data: {
        action: 'AUTO_REJECT',
        label: 'Từ chối eKYC thất bại',
        description: 'Điểm khớp ảnh khuôn mặt < 80% hoặc giả mạo Oval'
      }
    },
    {
      id: 'act-reject-cic',
      type: 'actionNode',
      position: { x: 380, y: 510 },
      data: {
        action: 'AUTO_REJECT',
        label: 'Từ chối Nợ xấu CIC',
        description: 'Khách hàng có nợ cần chú ý/nợ xấu nhóm 3-5'
      }
    },
    {
      id: 'act-approve',
      type: 'actionNode',
      position: { x: 40, y: 690 },
      data: {
        action: 'AUTO_APPROVE',
        label: 'Phê duyệt Siêu tốc',
        description: 'Đáp ứng 100% tiêu chí tín dụng chuẩn'
      }
    },
    {
      id: 'act-review',
      type: 'actionNode',
      position: { x: 260, y: 690 },
      data: {
        action: 'MANUAL_REVIEW',
        label: 'Chuyển Thẩm định viên',
        description: 'Cần xác minh nguồn thu thực tế do DTI > 50%'
      }
    }
  ];

  const defaultEdges = [
    {
      id: 'e-start-ekyc',
      source: 'node-start',
      target: 'cond-ekyc',
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 2 }
    },
    // eKYC check
    {
      id: 'e-ekyc-pass',
      source: 'cond-ekyc',
      sourceHandle: 'true',
      target: 'cond-cic',
      label: 'Đạt ≥ 80%',
      style: { stroke: '#10b981', strokeWidth: 2 }
    },
    {
      id: 'e-ekyc-fail',
      source: 'cond-ekyc',
      sourceHandle: 'false',
      target: 'act-reject-ekyc',
      label: 'Dưới 80%',
      style: { stroke: '#f43f5e', strokeWidth: 2 }
    },
    // CIC check
    {
      id: 'e-cic-pass',
      source: 'cond-cic',
      sourceHandle: 'true',
      target: 'cond-dti',
      label: 'Không nợ xấu',
      style: { stroke: '#10b981', strokeWidth: 2 }
    },
    {
      id: 'e-cic-fail',
      source: 'cond-cic',
      sourceHandle: 'false',
      target: 'act-reject-cic',
      label: 'Nợ xấu ≥ N3',
      style: { stroke: '#f43f5e', strokeWidth: 2 }
    },
    // DTI check
    {
      id: 'e-dti-pass',
      source: 'cond-dti',
      sourceHandle: 'true',
      target: 'act-approve',
      label: 'DTI an toàn',
      style: { stroke: '#10b981', strokeWidth: 2 }
    },
    {
      id: 'e-dti-fail',
      source: 'cond-dti',
      sourceHandle: 'false',
      target: 'act-review',
      label: 'DTI cao',
      style: { stroke: '#f59e0b', strokeWidth: 2 }
    }
  ];

  return { nodes: defaultNodes, edges: defaultEdges };
}

/**
 * transformFlowToDB:
 * Tuần tự hóa toàn bộ cấu trúc đồ thị thành cây quyết định (AST) và lưu trữ trạng thái layout
 */
export function transformFlowToDB(nodes, edges) {
  const startNode = nodes.find(n => n.type === 'startNode');
  
  // Xây dựng cây quyết định JSON phục vụ engine đánh giá tự động
  const decisionTree = {
    version: '2.0-AST',
    compiledAt: new Date().toISOString(),
    startNodeId: startNode ? startNode.id : null,
    totalConditions: nodes.filter(n => n.type === 'decisionNode').length,
    totalActions: nodes.filter(n => n.type === 'actionNode').length,
    nodes: nodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: n.data
    })),
    edges: edges.map(e => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle || null,
      target: e.target,
      label: e.label || ''
    }))
  };

  return decisionTree;
}

/**
 * validateFlowGraph:
 * Kiểm tra tính toàn vẹn của đồ thị luồng:
 * 1. Phải có ít nhất 1 StartNode
 * 2. Không được có node mồ côi (không kết nối vào hoặc ra)
 * 3. Mỗi nhánh điều kiện (true/false) nên có đích đến
 */
export function validateFlowGraph(nodes, edges) {
  const errors = [];

  // 1. Kiểm tra StartNode
  const startNodes = nodes.filter(n => n.type === 'startNode');
  if (startNodes.length === 0) {
    errors.push('Đồ thị luồng phải có ít nhất 01 khối Bắt Đầu (Start Node).');
  }

  // 2. Kiểm tra node mồ côi (Orphan nodes)
  nodes.forEach(node => {
    if (node.type === 'startNode') {
      const hasOutgoing = edges.some(e => e.source === node.id);
      if (!hasOutgoing) {
        errors.push(`Khối Bắt Đầu [${node.data?.label || node.id}] chưa được kết nối tới bước tiếp theo.`);
      }
    } else if (node.type === 'decisionNode') {
      const hasIncoming = edges.some(e => e.target === node.id);
      const hasOutgoing = edges.some(e => e.source === node.id);
      if (!hasIncoming) {
        errors.push(`Khối điều kiện [${node.data?.label || node.id}] không có nhánh đầu vào.`);
      }
      if (!hasOutgoing) {
        errors.push(`Khối điều kiện [${node.data?.label || node.id}] chưa có nhánh xử lý Đạt/Không đạt.`);
      }
    } else if (node.type === 'actionNode') {
      const hasIncoming = edges.some(e => e.target === node.id);
      if (!hasIncoming) {
        errors.push(`Khối hành động [${node.data?.label || node.id}] đang bị cô lập (không có nhánh trỏ tới).`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

