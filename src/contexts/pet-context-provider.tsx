'use client';

import { createContext, useOptimistic, useState } from 'react';
import { addPet, deletePet, editPet } from '@/actions/actions';
import { toast } from 'sonner';
import { Pet } from '@prisma/client';
import { PetEssentials } from '@/lib/types';

type PetContextProviderProps = {
  data: Pet[];
  children: React.ReactNode;
};

type TPetContext = {
  pets: Pet[];
  selectedPetId: Pet['id'] | null;
  selectedPet?: Pet;
  numberOfPets: number;
  handleChangeSelectedPetId: (id: Pet['id']) => void;
  handleAddPet: (newPet: PetEssentials) => Promise<void>;
  handleEditPet: (id: Pet['id'], newPetData: PetEssentials) => Promise<void>;
  handleCheckoutPet: (id: Pet['id']) => Promise<void>;
};

export const PetContext = createContext<TPetContext | null>(null);

const PetContextProvider = ({ data, children }: PetContextProviderProps) => {
  const [optimisticPets, setOptimisticPets] = useOptimistic(data, (state, { action, payload }) => {
    switch (action) {
      case 'add':
        return [...state, { ...payload, id: Math.random().toString() }];
      case 'edit':
        return state.map((pet) => {
          if (pet.id === payload.id) {
            return { ...pet, ...payload.newPetData };
          }
          return pet;
        });
      case 'delete':
        return state.filter((pet) => pet.id !== payload);
      default:
        return state;
    }
  });
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  const selectedPet = optimisticPets.find((pet) => pet.id === selectedPetId);
  const numberOfPets = optimisticPets.length;

  const handleAddPet = async (newPet: PetEssentials) => {
    setOptimisticPets({ action: 'add', payload: newPet });
    const error = await addPet(newPet);
    if (error) {
      toast.warning(error.message);
    }
  };

  const handleEditPet = async (petId: Pet['id'], newPetData: PetEssentials) => {
    setOptimisticPets({ action: 'edit', payload: { id: petId, newPetData } });
    const error = await editPet(petId, newPetData);
    if (error) {
      toast.warning(error.message);
    }
  };

  const handleCheckoutPet = async (petId: Pet['id']) => {
    setOptimisticPets({ action: 'delete', payload: petId });
    await deletePet(petId);
    setSelectedPetId(null);
  };

  const handleChangeSelectedPetId = (id: Pet['id']) => {
    setSelectedPetId(id);
  };

  return (
    <PetContext.Provider
      value={{
        pets: optimisticPets,
        selectedPetId,
        selectedPet,
        numberOfPets,
        handleChangeSelectedPetId,
        handleAddPet,
        handleEditPet,
        handleCheckoutPet,
      }}>
      {children}
    </PetContext.Provider>
  );
};

export default PetContextProvider;
