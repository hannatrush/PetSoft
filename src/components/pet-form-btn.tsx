import { Button } from './ui/button';

type PetFormBtnProps = {
  actionType: 'add' | 'edit';
};

const PetFormBtn = ({ actionType }: PetFormBtnProps) => {
  return (
    <Button type="submit" className="mt-5 self-end">
      {actionType === 'add' ? 'Add a new pet' : 'Edit pet'}
    </Button>
  );
};

export default PetFormBtn;
