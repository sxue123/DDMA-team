import { Button, Card, Form, Input, Typography, message } from "antd";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { login as loginApi, type LoginRequest } from "@/api/client";

type LocationState = { from?: { pathname: string } };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [messageApi, contextHolder] = message.useMessage();
  const from = (location.state as LocationState | null)?.from?.pathname ?? "/";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#f0f2f5",
      }}
    >
      {contextHolder}
      <Card style={{ width: 400 }} title="登录">
        <Typography.Paragraph type="secondary">
          已接入登录
          API。输入邮箱/手机和密码后，会调用后端登录接口；成功后会写入
          access_token，并进入受保护页面。
        </Typography.Paragraph>
        <Form<LoginRequest>
          layout="vertical"
          onFinish={async (values) => {
            try {
              const response = await loginApi(values);
              login({
                token: response.access_token,
                user: response.user,
              });
              messageApi.success("登录成功");
              navigate(from, { replace: true });
            } catch (error) {
              const err = error as Error;
              messageApi.error(err.message || "登录失败，请重试");
            }
          }}
        >
          <Form.Item
            label="邮箱或手机"
            name="identifier"
            rules={[{ required: true, message: "请输入邮箱或手机" }]}
          >
            <Input placeholder="user@example.com 或 +14155550101" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
        <Link to="/register">没有账户？去注册</Link>
      </Card>
    </div>
  );
}
