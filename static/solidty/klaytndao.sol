// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface CreatePoolInterface {
    function createPool(address tokenA,address tokenB,uint24 fee) external returns (address pool);    
}


interface KspInterface{
    function approve(address _spender, uint _value) external  returns (bool);
    function transferFrom(address _from, address _to, uint _value) external  returns (bool);
    function transfer(address _to, uint _value) external  returns (bool);
    function balanceOf(address _address) external view  returns (uint256);
}
interface DonationPoolInterface{
    function emergency() external returns(bool);
    function amountChange(uint256 _createFee) external ;
    function createPool() external ;
}
contract FactoryContract {
    struct makePoolAddressStruct{
        address makeAddress;
        address tokenA;
        address tokenB;
        uint24 fee;
        address contractAddress;
    }
    mapping(uint256 =>makePoolAddressStruct) public makePoolInfo;
    mapping(address => uint256) public donationInfo;
    address[] public donationAddress;
    address public owner;
    address public communityAddress;
    uint256 public donationFeeRatio;
    uint256 public createPoolFee;
    uint256 public makePoolCount;
    uint256 public totalDonation;
    uint256[] public mappingCount;
    CreatePoolInterface makeCreatePool;
    DonationPoolInterface donationPool;
    KspInterface KSP;


    modifier onlyOwner() {
    require(msg.sender == owner, "Only owner call");
    _;
    }

    event ceatePoolMakeFunding(address newPool);
    event createPoolFeeTrasnfer(uint256 createPoolFee);
    event emergencyTransfer(address _address,uint256 amount);
    event donationTransfer(address _sender,uint256 amount);
    event donationFeeTransfer(address _sender,address _owner,uint256 amount);
    event changeMakeFee(uint256 fee);
    event chnageDoantionFeeRatio(uint256 feeRation);

    constructor(){
        owner = msg.sender;
        communityAddress = 0xeB0B74e94cCB11B07ea77fc21b315aA630EDF385;
        createPoolFee = 1*(10**18);
        donationFeeRatio = 0;
        makeCreatePool = CreatePoolInterface(0xA15Be7e90df29A4aeaD0C7Fc86f7a9fBe6502Ac9);
        KSP = KspInterface(0xC6a2Ad8cC6e4A7E08FC37cC5954be07d499E7654);
        makePoolCount = 0;
        totalDonation = 0;
    }

    function changeCreatePoolFee(uint256 _createPoolfee) onlyOwner public{
        createPoolFee = _createPoolfee*(10**18);
        emit changeMakeFee(_createPoolfee);
    }

    function changeDonationFee(uint256 feeRatio) onlyOwner public{
        donationFeeRatio = feeRatio;
        emit chnageDoantionFeeRatio(feeRatio);
    }
    function make(address tokenA,address tokenB,uint24 fee) public {
        KSP.transferFrom(msg.sender,owner, createPoolFee);
        MakePoolContract newPool = new MakePoolContract(tokenA,tokenB,fee);
        makePoolInfo[makePoolCount].makeAddress = msg.sender;
        makePoolInfo[makePoolCount].tokenA = tokenA;
        makePoolInfo[makePoolCount].tokenB = tokenB;
        makePoolInfo[makePoolCount].fee = fee;
        makePoolInfo[makePoolCount].contractAddress = address(newPool);
        mappingCount.push(makePoolCount);
        makePoolCount++;
        emit ceatePoolMakeFunding(address(newPool));
        emit createPoolFeeTrasnfer(createPoolFee);
    }
    function donation(address _tokenA,address _tokenB,uint24 _fee, uint256 amount) public returns (bool) {
        address makePoolAddress;
        for (uint256 i = 0; i < mappingCount.length; i++) 
        {
            if(makePoolInfo[i].tokenA == _tokenA && makePoolInfo[i].tokenB == _tokenB && makePoolInfo[i].fee == _fee)
            {
                makePoolAddress = makePoolInfo[i].contractAddress;
            }
        }
        uint256 fee = (amount*donationFeeRatio)/100;
        uint256 amountWithoutFee = amount - fee;
        KSP.transferFrom(msg.sender, owner, fee );
        KSP.transferFrom(msg.sender, makePoolAddress, amountWithoutFee);
        if(donationInfo[msg.sender] == 0 ){
            donationInfo[msg.sender] = amountWithoutFee;
            donationAddress.push(msg.sender);
        }
        else{
            donationInfo[msg.sender] += amountWithoutFee;
        }
        totalDonation += amountWithoutFee;
        emit donationTransfer(msg.sender, amountWithoutFee);
        emit donationFeeTransfer(msg.sender,owner, fee);
        return true;
    }
    function emergency(address _address) onlyOwner public returns(bool)  {
    donationPool=DonationPoolInterface(_address);
    donationPool.emergency();
    KSP.transfer(communityAddress, KSP.balanceOf(address(this)));
    emit emergencyTransfer(_address,KSP.balanceOf(_address));
    return true;
    }
    function setRequire(address contractAddress, uint256 amount) onlyOwner public{
        donationPool=DonationPoolInterface(contractAddress);
        donationPool.amountChange(amount);
    }

    function donationUserNum() public view returns(uint256){
        return donationAddress.length;
    }
    function balance(address _tokenA , address _tokenB , uint24 _fee) public view returns(uint256){
        address makePoolAddress;
        for (uint256 i = 0; i < mappingCount.length; i++) 
        {
            if(makePoolInfo[i].tokenA == _tokenA && makePoolInfo[i].tokenB == _tokenB && makePoolInfo[i].fee == _fee)
            {
                makePoolAddress = makePoolInfo[i].contractAddress;
            }
        }
            return KSP.balanceOf(address(makePoolAddress));
    }
    function createExcute(address _tokenA , address _tokenB , uint24 _fee) public  {
       address makePoolAddress;
        for (uint256 i = 0; i < mappingCount.length; i++) 
        {
            if(makePoolInfo[i].tokenA == _tokenA && makePoolInfo[i].tokenB == _tokenB && makePoolInfo[i].fee == _fee)
            {
                makePoolAddress = makePoolInfo[i].contractAddress;
            }
        }
            donationPool=DonationPoolInterface(makePoolAddress);
            donationPool.createPool();
    }
    }



contract MakePoolContract {
    address public owner;
    address public tokenA;
    address public tokenB;
    address public createPoolContractAddress;
    uint24 public fee;
    uint256 public createFee = 1000*(10**18);

    modifier onlyOwner() {
    require(msg.sender == owner, "Only owner call");
    _; 
    }

    CreatePoolInterface makeCreatePool;
    KspInterface KSP;
    
    constructor(address _tokenA, address _tokenB, uint24 _fee) {
        makeCreatePool = CreatePoolInterface(0xA15Be7e90df29A4aeaD0C7Fc86f7a9fBe6502Ac9);
        createPoolContractAddress = 0xA15Be7e90df29A4aeaD0C7Fc86f7a9fBe6502Ac9;
        KSP = KspInterface(0xC6a2Ad8cC6e4A7E08FC37cC5954be07d499E7654);
        tokenA = _tokenA;
        tokenB = _tokenB;
        fee = _fee;
        owner = msg.sender;
        }
    function amountChange(uint256 _createFee) onlyOwner public {
        createFee = _createFee;
    }
    function createPool() public{
        require(KSP.balanceOf(address(this))>=createFee,"KSP balanceOf check");
        address newPoolAddress;
        KSP.approve(createPoolContractAddress, createFee);
        newPoolAddress = makeCreatePool.createPool(tokenA,tokenB,fee);
    }
    function emergency() onlyOwner public returns(bool){
        KSP.transfer(owner,KSP.balanceOf(address(this)));
        return true;
    }
}
