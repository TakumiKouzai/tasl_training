INSERT INTO task (title, description, priority, status, created_at, updated_at)
VALUES (
    'タスクA（高）',
    '優先度Aのサンプルタスク',
    'A',
    '未着手',
    TIMESTAMP '2026-06-15 10:00:00',
    TIMESTAMP '2026-06-15 10:00:00'
);

INSERT INTO task (title, description, priority, status, created_at, updated_at)
VALUES (
    'タスクB（中）',
    '優先度Bのサンプルタスク',
    'B',
    '進行中',
    TIMESTAMP '2026-06-15 11:00:00',
    TIMESTAMP '2026-06-15 11:00:00'
);

INSERT INTO task (title, description, priority, status, created_at, updated_at)
VALUES (
    'タスクC（低）',
    '優先度Cのサンプルタスク',
    'C',
    '完了',
    TIMESTAMP '2026-06-15 12:00:00',
    TIMESTAMP '2026-06-15 12:00:00'
);
