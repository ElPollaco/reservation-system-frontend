import {getRoleName, StaffRole} from '../../../context/AuthContext';
import styles from './RoleBadge.module.css';

const RoleBadge = ({role}) => {
  const getRoleVariant = (role) => {
    const roleNum = typeof role === 'string' ? StaffRole[role] : role;

    switch (roleNum) {
      case StaffRole.Manager:
        return styles.manager;
      case StaffRole.ReceptionEmployee:
        return styles.reception;
      case StaffRole.Trainer:
        return styles.trainer;
      default:
        return styles.default;
    }
  };

  return (
    <span className={`${styles.badge} ${getRoleVariant(role)}`}>
      {getRoleName(role)}
    </span>
  );
};

export default RoleBadge;