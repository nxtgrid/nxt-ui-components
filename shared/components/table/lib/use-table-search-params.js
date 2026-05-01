import { reject, evolve, either, isNil, isEmpty } from 'ramda';
import { useRouter } from 'vue-router';
import { interpretStringBoolean } from '../../../libraries/type-helpers';

const rejectEmpty = reject(either(isNil, isEmpty));

export const useTableSearchParams = () => {
  const router = useRouter();

  return {
    update(newVariables) {
      const oldVariables = this.get();
      router.replace({
        path: router.currentRoute.value.path,
        query: rejectEmpty({ ...oldVariables, ...newVariables }),
      });
    },

    get() {
      return evolve(
        {
          limit: parseInt,
          offset: parseInt,
          filters: {
            is_active: interpretStringBoolean,
            has_fully_paid_connection_fees: interpretStringBoolean,
          },
        },
        router.currentRoute.value.query,
      );
    },
  };
};
