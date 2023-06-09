import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { PersonAlreadyExistsError } from '../../../shared/error/index.js';
import { DoFactory, MapperTestModule } from '../../../../test/utils/index.js';
import { CreatePersonDto } from '../domain/create-person.dto.js';
import { PersonService } from '../domain/person.service.js';
import { PersonApiMapperProfile } from './person-api.mapper.profile.js';
import { PersonUc } from './person.uc.js';

describe('PersonUc', () => {
    let module: TestingModule;
    let personUc: PersonUc;
    let personServiceMock: DeepMocked<PersonService>;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [MapperTestModule],
            providers: [
                PersonUc,
                PersonApiMapperProfile,
                {
                    provide: PersonService,
                    useValue: createMock<PersonService>(),
                },
            ],
        }).compile();
        personUc = module.get(PersonUc);
        personServiceMock = module.get(PersonService);
    });

    afterAll(async () => {
        await module.close();
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(personUc).toBeDefined();
    });

    describe('createPerson', () => {
        describe('when person not exists', () => {
            it('should create a new person', async () => {
                personServiceMock.createPerson.mockResolvedValue({
                    ok: true,
                    value: DoFactory.createPerson(true),
                });
                await expect(personUc.createPerson({} as CreatePersonDto)).resolves.not.toThrow();
            });
        });

        describe('when person already exists', () => {
            it('should throw PersonAlreadyExistsError', async () => {
                personServiceMock.createPerson.mockResolvedValue({
                    ok: false,
                    error: new PersonAlreadyExistsError(''),
                });
                await expect(personUc.createPerson({} as CreatePersonDto)).rejects.toThrowError(
                    PersonAlreadyExistsError,
                );
            });
        });
    });
});
