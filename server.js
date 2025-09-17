const express = require('express');
const { Pool } = require('pg'); // PostgreSQL 클라이언트
const cors = require('cors');   // CORS 미들웨어

// --- 2. Express 앱 초기화 및 설정 ---
const app = express();
const port = 3000;

// --- 3. 미들웨어 설정 ---
const corsOptions = {
    origin: 'https://dlyyxc8xzu8oq.cloudfront.net', // 여러분의 CloudFront 도메인 주소
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json()); // 요청 본문(body)을 JSON으로 파싱

// --- 4. 데이터베이스 연결 설정 ---
// Docker 컨테이너 실행 시 환경 변수(-e 옵션)를 통해 주입받습니다.
const pool = new Pool({
    user: process.env.RDS_USERNAME || 'postgres',
    host: process.env.RDS_HOSTNAME || 'localhost',
    database: process.env.RDS_DB_NAME || 'postgres',
    password: process.env.RDS_PASSWORD || 'password',
    port: process.env.RDS_PORT || 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

/*
 * --- 데이터베이스 테이블 생성 (사전 작업) ---
 * PostgreSQL에 접속하여 아래 SQL 쿼리를 실행해 'todos' 테이블을 미리 만들어야 합니다.
 *
 * CREATE TABLE todos (
 * id SERIAL PRIMARY KEY,
 * text VARCHAR(255) NOT NULL,
 * completed BOOLEAN DEFAULT FALSE,
 * created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
 * );
 *
 */

// --- 5. API 라우트(경로) 정의 ---

// 기본 경로 - 서버 상태 확인용
app.get('/', (req, res) => {
    res.send('Todo List API 서버가 정상적으로 동작하고 있습니다.');
});

// [GET] 모든 Todo 항목 조회
app.get('/api/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Todo 조회 오류:', err);
        res.status(500).json({ error: '데이터베이스 조회 중 오류가 발생했습니다.' });
    }
});

// [POST] 새로운 Todo 항목 추가
app.post('/api/todos', async (req, res) => {
    const { text } = req.body; // 요청 본문에서 'text' 추출
    if (!text) {
        return res.status(400).json({ error: 'Todo 내용(text)이 필요합니다.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO todos (text) VALUES ($1) RETURNING *',
            [text]
        );
        res.status(201).json(result.rows[0]); // 생성된 항목 반환
    } catch (err) {
        console.error('Todo 추가 오류:', err);
        res.status(500).json({ error: '데이터베이스에 추가 중 오류가 발생했습니다.!' });
    }
});

// [PUT] 특정 Todo 항목 수정 (완료/미완료 처리)
app.put('/api/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;

    if (text === undefined && completed === undefined) {
        return res.status(400).json({ error: '수정할 내용(text 또는 completed)이 필요합니다.' });
    }

    try {
        // 동적으로 쿼리 생성
        const fields = [];
        const values = [];
        let queryIndex = 1;

        if (text !== undefined) {
            fields.push(`text = $${queryIndex++}`);
            values.push(text);
        }
        if (completed !== undefined) {
            fields.push(`completed = $${queryIndex++}`);
            values.push(completed);
        }
        values.push(id);

        const updateQuery = `UPDATE todos SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING *`;

        const result = await pool.query(updateQuery, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: '해당 ID의 Todo를 찾을 수 없습니다.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Todo 수정 오류:', err);
        res.status(500).json({ error: '데이터베이스 수정 중 오류가 발생했습니다.' });
    }
});


// [DELETE] 특정 Todo 항목 삭제
app.delete('/api/todos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: '해당 ID의 Todo를 찾을 수 없습니다.' });
        }
        res.status(200).json({ message: '성공적으로 삭제되었습니다.', deletedItem: result.rows[0] });
    } catch (err) {
        console.error('Todo 삭제 오류:', err);
        res.status(500).json({ error: '데이터베이스 삭제 중 오류가 발생했습니다.' });
    }
});


// --- 6. 서버 실행 ---
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
    console.log('데이터베이스 연결을 확인해주세요.');
});

// 최종 배포를 위한 마지막 수정2