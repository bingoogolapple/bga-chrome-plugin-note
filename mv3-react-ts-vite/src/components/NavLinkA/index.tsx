/**
 * 路由和普通链接都用该组件
 */
import React, { AnchorHTMLAttributes } from 'react'
import { NavLink } from 'react-router-dom'

export interface IProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  path: string
}

const NavLinkA: React.FC<IProps> = ({ path, children, ...props }) => {
  return path.startsWith('http') ? (
    <a href={path} target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  ) : (
    <NavLink to={path} {...props}>
      {children}
    </NavLink>
  )
}

export default NavLinkA
