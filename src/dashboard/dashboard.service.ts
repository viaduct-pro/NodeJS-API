import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interest } from '../entities/interest.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { DropIn } from '../entities/drop-in.entity';
import _ = require('lodash');
const moment = require('moment');

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Interest)
    private readonly interestsRepository: Repository<Interest>,
    @InjectRepository(DropIn)
    private readonly dropInRepository: Repository<DropIn>, // @Inject() moment: Moment,
  ) {}

  async getInterestsUsage(request, teamId) {
    const findUser = await this.userRepository.findOne({
      where: { auth0Id: request.user.id },
      relations: [
        'dropInsOwner',
        'dropInsRecipient',
        'dropInsOwner.team',
        'dropInsRecipient.team',
      ],
    });

    const dropInsUserOwner = await findUser.dropInsOwner;

    const dropInsUserRecipient = await findUser.dropInsRecipient;

    const interests = [];

    for (const ownerDropIn of dropInsUserOwner) {
      if (ownerDropIn.team.id == teamId) {
        for (const interestOwner of ownerDropIn.interests) {
          interests.push(interestOwner);
        }
      }
    }

    for (const recipientDropIn of dropInsUserRecipient) {
      if (recipientDropIn.team.id == teamId) {
        for (const interestRecipient of recipientDropIn.interests) {
          interests.push(interestRecipient);
        }
      }
    }

    const totalCount = interests.length;

    const interestsCount = [];

    interests.forEach(function (interest) {
      interestsCount[interest.name] = (interestsCount[interest.name] || 0) + 1;
    });

    const key = 'name';

    const arrayUniqueByKey = [
      ...new Map(interests.map((item) => [item[key], item])).values(),
    ];

    const resultArray = [];

    for (const int of arrayUniqueByKey) {
      const obj = {
        name: int.name,
        count: interestsCount[int.name],
        percent: Math.round((interestsCount[int.name] / totalCount) * 100),
      };
      resultArray.push(obj);
    }

    const newArray = resultArray.sort((inerestOne, interestTwo) => {
      if (inerestOne.count < interestTwo.count) {
        return 1;
      } else {
        return -1;
      }
    });

    return newArray;
  }

  async getDropInsCount(request) {
    const authUser = await this.userRepository.findOne({
      auth0Id: request.user.id,
    });

    const dropInsSent = await authUser.dropInsOwner;

    const dropInsReceived = await authUser.dropInsRecipient;

    return {
      dropInsSentCount: dropInsSent.length,
      dropInsReceivedCount: dropInsReceived.length,
    };
  }

  async getDropInsWithFilter(request) {
    const dateFrom = moment(request.body.dateFrom).format(
      'YYYY-MM-DD HH:mm:ss',
    );
    const dateTo = moment(request.body.dateTo).format('YYYY-MM-DD HH:mm:ss');

    const findUser = await this.userRepository.findOne({
      auth0Id: request.user.id,
    });

    const dropInsOwner = await this.dropInRepository
      .createQueryBuilder('dropIns')
      .leftJoin('dropIns.owner', 'owner')
      .leftJoin('dropIns.team', 'team')
      .where('owner.id = :userId', { userId: findUser.id })
      .andWhere('team.id = :teamId', { teamId: request.body.teamId })
      .andWhere('dropIns.createdAt >= :dateFrom', { dateFrom: dateFrom })
      .andWhere('dropIns.createdAt <= :dateTo', { dateTo: dateTo })
      .orderBy('dropIns.createdAt', 'ASC')
      .getMany();

    const dropInsRecipient = await this.dropInRepository
      .createQueryBuilder('dropIns')
      .leftJoin('dropIns.recipient', 'recipient')
      .leftJoin('dropIns.team', 'team')
      .where('recipient.id = :userId', { userId: findUser.id })
      .andWhere('team.id = :teamId', { teamId: request.body.teamId })
      .andWhere('dropIns.createdAt >= :dateFrom', { dateFrom: dateFrom })
      .andWhere('dropIns.createdAt <= :dateTo', { dateTo: dateTo })
      .orderBy('dropIns.createdAt', 'ASC')
      .getMany();

    const labelsArray = [];
    const dropInsOwnerObj = {};
    const dropInsRecipientObj = {};

    labelsArray.push(moment(request.body.dateFrom).format('YYYY-MM-DD'));
    labelsArray.push(moment(request.body.dateTo).format('YYYY-MM-DD'));

    const firstDate = moment(request.body.dateFrom);
    const lastDate = moment(request.body.dateTo);

    console.log(lastDate.diff(firstDate, 'days'));

    for (
      let i = 1;
      i <
      moment(request.body.dateTo).diff(moment(request.body.dateFrom), 'days');
      i++
    ) {
      const newZeroDate = moment(request.body.dateFrom).add(i, 'days');
      if (labelsArray[moment(newZeroDate).format('YYYY-MM-DD')] == undefined) {
        labelsArray.push(moment(newZeroDate).format('YYYY-MM-DD'));
      }
    }

    for (const dropInOwn of dropInsOwner) {
      const dateFormate = moment(dropInOwn.createdAt).format('YYYY-MM-DD');
      if (dropInsOwnerObj[dateFormate] == undefined) {
        dropInsOwnerObj[dateFormate] = (dropInsOwnerObj[dateFormate] || 0) + 1;
      } else {
        dropInsOwnerObj[dateFormate] = (dropInsOwnerObj[dateFormate] || 0) + 1;
      }
      if (!labelsArray.includes(dateFormate)) {
        labelsArray.push(dateFormate);
      }
    }

    for (const dropInRec of dropInsRecipient) {
      const dateFormate = moment(dropInRec.createdAt).format('YYYY-MM-DD');

      if (dropInsRecipientObj[dateFormate] == undefined) {
        dropInsRecipientObj[dateFormate] =
          (dropInsRecipientObj[dateFormate] || 0) + 1;
      } else {
        dropInsRecipientObj[dateFormate] =
          (dropInsRecipientObj[dateFormate] || 0) + 1;
      }
      if (!labelsArray.includes(dateFormate)) {
        labelsArray.push(dateFormate);
      }
    }
    const sortedLabels = labelsArray.sort(function (a, b) {
      return Date.parse(a) - Date.parse(b);
    });

    for (const label of sortedLabels) {
      if (dropInsOwnerObj[label] == undefined) {
        dropInsOwnerObj[label] = 0;
      }
      if (dropInsRecipientObj[label] == undefined) {
        dropInsRecipientObj[label] = 0;
      }
    }

    return {
      labels: sortedLabels,
      dropInsOwner: Object.values(this.orderByDatesObject(dropInsOwnerObj)),
      dropInsRecipient: Object.values(
        this.orderByDatesObject(dropInsRecipientObj),
      ),
      dropInsOwnerCount: dropInsOwner.length,
      dropInsRecipientCount: dropInsRecipient.length,
    };
  }

  orderByDatesObject(obj) {
    const orderedDates = {};

    Object.keys(obj)
      .sort(function (a, b) {
        return (
          moment(a, 'YYYY-MM-DD').toDate() - moment(b, 'YYYY-MM-DD').toDate()
        );
      })
      .forEach(function (key) {
        orderedDates[key] = obj[key];
      });
    console.log(orderedDates);
    return orderedDates;
  }
}
