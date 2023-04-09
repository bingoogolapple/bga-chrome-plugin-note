import React, { Suspense } from 'react'
import {
  HashRouter as Router,
  Navigate,
  RouteObject,
  useLocation,
  useRoutes,
} from 'react-router-dom'
import { ConfigProvider, Spin, Layout, Menu } from 'antd'
import zhCN from 'antd/lib/locale/zh_CN'
import NavLinkA from '@/components/NavLinkA'
const First = React.lazy(() => import('./First'))
const Second = React.lazy(() => import('./Second'))

const { Header, Content } = Layout

const ROUTE_OBJECT_LIST: RouteObject[] = [
  {
    index: true,
    element: <First />,
  },
  {
    path: 'First',
    element: <First />,
  },
  {
    path: 'Second',
    element: <Second />,
  },
  { path: '*', element: <Navigate to="/First" replace /> },
]
const RouteObjectList: React.FC = () => {
  const routes = useRoutes(ROUTE_OBJECT_LIST)
  return routes
}

const TopMenu: React.FC = () => {
  const location = useLocation()
  console.log('location', location)
  const defaultSelectedKey =
    location.pathname === '/' ? '/First' : location.pathname

  return (
    <Menu
      theme="dark"
      mode="horizontal"
      defaultSelectedKeys={[defaultSelectedKey]}
    >
      <Menu.Item key="/First">
        <NavLinkA path="/First">First</NavLinkA>
      </Menu.Item>
      <Menu.Item key="/Second">
        <NavLinkA path="/Second">Second</NavLinkA>
      </Menu.Item>
    </Menu>
  )
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Layout>
          <Header>
            <TopMenu />
          </Header>
          <Content style={{ backgroundColor: 'white' }}>
            <Suspense fallback={<Spin />}>
              <RouteObjectList />
            </Suspense>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  )
}

export default App
