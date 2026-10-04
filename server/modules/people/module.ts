export type { AvatarStore, PeopleDeps, ValidatedImage } from "./ports";
export type { ProfileInput } from "./application/profiles";
export {
  createPeopleUseCases,
  type PeopleUseCases,
} from "./application/use-cases";
export { addPeopleRoutes } from "./http/routes";
