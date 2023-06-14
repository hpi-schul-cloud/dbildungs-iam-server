import { Mapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { DomainError, PersonAlreadyExistsError } from '../../shared/index.js';
import { CreatePersonDto } from './dto/index.js';
import { PersonDo } from './person.do.js';
import { PersonEntity } from './person.entity.js';
import { PersonRepo } from './person.repo.js';

@Injectable()
export class PersonService {
    public constructor(
        private readonly personRepo: PersonRepo,
        @Inject(getMapperToken()) private readonly mapper: Mapper,
    ) {}

    public async createPerson(person: CreatePersonDto): Promise<Result<PersonDo, DomainError>> {
        if (person.referrer && (await this.personRepo.findByReferrer(person.referrer))) {
            return {
                ok: false,
                error: new PersonAlreadyExistsError(`Person with referrer ${person.referrer} already exists`),
            };
        }
        const newPerson = this.mapper.map(person, CreatePersonDto, PersonEntity);
        await this.personRepo.save(newPerson);
        return { ok: true, value: new PersonDo(newPerson) };
    }
}