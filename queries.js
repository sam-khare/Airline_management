// 1 get the planes in working condition
db.plane.find({status:"Working"}, {_id: 0, opStartDate: 0});


//2
//Get the 3rd, 4th and 5th most recent bookings
db.booking.find().sort({booking_data_time: -1}).limit(3).skip(2);


//3
//Get the number of flights in a given week
db.flight.find({departure_date_time: {$gte: new Date("2022-01-01"), $lt: new Date("2022-01-08")}}).count();



//4
db.plane.find({}, {_id:0, opStartDate:1}).sort({opStartDate: 1}).limit(1);

// 5
db.booking.aggregate([
	{ 
		$group: {_id:1, totalFare:{$sum:"$Fare"}}
	}	
]);


//6
//Get what number of our planes are boeing and what are airbus
db.plane.aggregate([{$group:{_id:'$make',
        total: {$sum:1}}},
        {$project:{Make:"$_id",NumOfPlanes:"$total",_id:0}}
        ]);


//7

db.employee.aggregate([ {$unwind:'$employmentRecords'},
                     
                                            
                      {$group:{_id:'$employmentRecords.position',Salary: {$sum: "$employmentRecords.monthlySalary"}}},
                      
                      {$project:{Role:'$_id',SumOfSalary:'$Salary',_id:0}}
                     ])

//8

db.booking.aggregate({$group:
                       {_id:'$flight_id',Passenger_Count:{$sum:1}}},
                      {$project:
                      {Flight_id:'$_id',
                      Passenger_count:'$Passenger_Count',_id:0}})  
                      

//9
db.booking.aggregate(		
	
	
	{$match:{Fare:{$gt:2000}}},
	{
		$lookup: {from: "flight", localField: "flight_id", foreignField: "id", as: "flight_details"}
	},
	{
		$unwind: "$flight_details"
	},
	
	{
	    $project:{Booking_person:"$bookingPerson",Passenger:"$passengerName",totalfare:'$Fare',
	    Departure_Date:"$flight_details.departure_date_time",Arrival_Date:"$flight_details.arrival_date_time",
	    Journey_length:"$flight_details.journey_length",_id:0}
	}

	
);

//10
db.flight.aggregate([
      
   {
      $lookup:{
         from:"airport",
         localField:"origin_airport_id",
         foreignField:"id",
         as:"origin_ap_records"
      }
   },
   {
      $unwind:"$origin_ap_records"
   },
     {
      $lookup:{
         from:"airport",
         localField:"destination_airport_id",
         foreignField:"id",
         as:"destination_ap_records"
      }
   },
   {
      $unwind:"$destination_ap_records"
   },
    {
      $lookup:{
         from:"employee",
         localField:"pilot_id",
         foreignField:"id",
         as:"pilot_records"
      }
   },
    {
      $unwind:"$pilot_records"
   },
   {
      $lookup:{
         from:"employee",
         localField:"copilot",
         foreignField:"id",
         as:"copilot_records"
      }
   },
    {
      $unwind:"$copilot_records"
   },
   
  {$project:{flight_id:"$id",origin:"$origin_ap_records.airportLocation",Destination:"$destination_ap_records.airportLocation",Pilot:"$pilot_records.fullName",Copilot:"$copilot_records.fullName",_id:0}}


]);

//11
db.employee.aggregate([
    { '$unwind': '$employmentRecords' },
    { '$group': {
        '_id': '$employmentRecords.position', 
        'maxSalary': { '$max': '$employmentRecords.monthlySalary' }, 
        'persons': { 
            '$push': {
                'Name': '$fullName', 
                'Salary': '$employmentRecords.monthlySalary' 
            }
        }
    }}, 
    { '$project': { 
        'maxSalary': 1, 
        'persons': { 
            '$setDifference': [
                { '$map': {
                    'input': '$persons', 
                    'as': 'person', 
                    'in': {
                        '$cond': [
                            { '$eq': [ '$$person.Salary', '$maxSalary' ] }, 
                            '$$person.Name', 
                            false
                        ]
                    }
                }}, 
                [false]
            ]
        }
    }}
])


///////////////////////////////






