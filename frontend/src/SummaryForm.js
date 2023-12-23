import React, { useState } from 'react';
import { Form, Input, Select, Button, Spin, Space, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

const { Option } = Select;

const SummaryForm = () => {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [selectedBackend, setSelectedBackend] = useState('symfony');

    const handleBackendChange = (value) => {
        setSelectedBackend(value);
    };

    const clearSummary = () => {
        setSummary('');
    };

    const onFinish = async (values) => {
        const { text, language } = values;
        setLoading(true);

        clearSummary();

        let serverUrl = '';

        if (selectedBackend === 'symfony') {
            serverUrl = process.env.REACT_APP_SYMFONY_BACKEND_URL;
        } else if (selectedBackend === 'node') {
            serverUrl = process.env.REACT_APP_NODE_BACKEND_URL;
        }

        const response = await fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({ text, language }),
        });

        const data = await response.json();
        setSummary(data.summary);
        setLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(summary);
        message.success('Copied to clipboard');
        setCopied(true);
    };

    return (
        <Form onFinish={onFinish} layout="vertical">
            <Form.Item
                label="Long Text"
                name="text"
                rules={[{ required: true, message: 'Please enter a long text' }]}
            >
                <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
                label="Language (to translate to)"
                name="language"
                rules={[{ required: true, message: 'Please select a language' }]}
            >
                <Select>
                    <Option value="Greek">Greek</Option>
                    <Option value="English">English</Option>
                    <Option value="French">French</Option>
                    <Option value="Spanish">Spanish</Option>
                    {/* Add more options for other languages */}
                </Select>
            </Form.Item>
            <Form.Item
                label="Backend"
                name="backend"
                rules={[{ required: true, message: 'Please select a backend' }]}
            >
                <Select value={selectedBackend} onChange={handleBackendChange}>
                    <Option value="symfony">Symfony</Option>
                    <Option value="node">Node.js</Option>
                </Select>
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" disabled={loading}>
                    {loading ? <Spin /> : 'Submit'}
                </Button>
            </Form.Item>
            <Form.Item label="Summary">
                <Input.TextArea value={summary} rows={4} readOnly={!summary} />
                {summary && (
                    <Space style={{ marginTop: '8px' }}>
                        <Button icon={<CopyOutlined />} onClick={handleCopy} disabled={copied}>
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                    </Space>
                )}
            </Form.Item>
        </Form>
    );
};

export default SummaryForm;
