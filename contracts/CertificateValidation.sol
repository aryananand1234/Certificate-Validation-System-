// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CertificateValidation
 * @dev Enhanced certificate validation system with revocation and role-based access control
 * @author Certificate Validation System
 */
contract CertificateValidation {
    
    // Structs
    struct College {
        string name;
        bool isApproved;
        uint256 registeredAt;
        uint256 certificatesIssued;
    }
    
    struct Certificate {
        string firstName;
        string lastName;
        string course;
        address issuer;
        uint256 issuedAt;
        bool isRevoked;
        string revocationReason;
    }
    
    // State variables
    address public owner;
    mapping(address => College) public colleges;
    mapping(address => Certificate) public certificates;
    address[] public collegeList;
    address[] public certificateHolders;
    
    // Events
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event CollegeAdded(address indexed collegeAddress, string name, uint256 timestamp);
    event CollegeRemoved(address indexed collegeAddress, uint256 timestamp);
    event CertificateIssued(
        address indexed student,
        string firstName,
        string lastName,
        string course,
        address indexed issuer,
        uint256 timestamp
    );
    event CertificateRevoked(
        address indexed student,
        address indexed revokedBy,
        string reason,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyApprovedCollege() {
        require(colleges[msg.sender].isApproved, "Only approved colleges can perform this action");
        _;
    }
    
    modifier onlyOwnerOrIssuer(address student) {
        require(
            msg.sender == owner || msg.sender == certificates[student].issuer,
            "Only owner or certificate issuer can perform this action"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Transfer ownership to a new address
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    /**
     * @dev Add a new approved college
     * @param collegeAddress Address of the college
     * @param name Name of the college
     */
    function addCollege(address collegeAddress, string memory name) external onlyOwner {
        require(collegeAddress != address(0), "Invalid college address");
        require(!colleges[collegeAddress].isApproved, "College already exists");
        require(bytes(name).length > 0, "College name cannot be empty");
        
        colleges[collegeAddress] = College({
            name: name,
            isApproved: true,
            registeredAt: block.timestamp,
            certificatesIssued: 0
        });
        
        collegeList.push(collegeAddress);
        emit CollegeAdded(collegeAddress, name, block.timestamp);
    }
    
    /**
     * @dev Remove an approved college
     * @param collegeAddress Address of the college to remove
     */
    function removeCollege(address collegeAddress) external onlyOwner {
        require(colleges[collegeAddress].isApproved, "College not found");
        
        colleges[collegeAddress].isApproved = false;
        emit CollegeRemoved(collegeAddress, block.timestamp);
    }
    
    /**
     * @dev Check if an address is an approved college
     * @param collegeAddress Address to check
     * @return bool True if approved college
     */
    function isApprovedCollege(address collegeAddress) external view returns (bool) {
        return colleges[collegeAddress].isApproved;
    }
    
    /**
     * @dev Issue a new certificate
     * @param student Student's wallet address
     * @param firstName Student's first name
     * @param lastName Student's last name
     * @param course Course name
     */
    function issueCertificate(
        address student,
        string memory firstName,
        string memory lastName,
        string memory course
    ) external onlyApprovedCollege {
        require(student != address(0), "Invalid student address");
        require(bytes(firstName).length > 0, "First name cannot be empty");
        require(bytes(lastName).length > 0, "Last name cannot be empty");
        require(bytes(course).length > 0, "Course cannot be empty");
        require(bytes(certificates[student].firstName).length == 0, "Certificate already exists for this address");
        
        certificates[student] = Certificate({
            firstName: firstName,
            lastName: lastName,
            course: course,
            issuer: msg.sender,
            issuedAt: block.timestamp,
            isRevoked: false,
            revocationReason: ""
        });
        
        certificateHolders.push(student);
        colleges[msg.sender].certificatesIssued++;
        
        emit CertificateIssued(student, firstName, lastName, course, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Revoke a certificate
     * @param student Address of the certificate holder
     * @param reason Reason for revocation
     */
    function revokeCertificate(address student, string memory reason) 
        external 
        onlyOwnerOrIssuer(student) 
    {
        require(bytes(certificates[student].firstName).length > 0, "Certificate not found");
        require(!certificates[student].isRevoked, "Certificate already revoked");
        require(bytes(reason).length > 0, "Revocation reason required");
        
        certificates[student].isRevoked = true;
        certificates[student].revocationReason = reason;
        
        emit CertificateRevoked(student, msg.sender, reason, block.timestamp);
    }
    
    /**
     * @dev View certificate details
     * @param student Address of the certificate holder
     * @return Certificate details
     */
    function viewCertificate(address student) 
        external 
        view 
        returns (
            string memory firstName,
            string memory lastName,
            string memory course,
            address issuer,
            uint256 issuedAt,
            bool isRevoked,
            string memory revocationReason
        ) 
    {
        Certificate memory cert = certificates[student];
        require(bytes(cert.firstName).length > 0, "Certificate not found");
        
        return (
            cert.firstName,
            cert.lastName,
            cert.course,
            cert.issuer,
            cert.issuedAt,
            cert.isRevoked,
            cert.revocationReason
        );
    }
    
    /**
     * @dev Get college details
     * @param collegeAddress Address of the college
     * @return College details
     */
    function getCollegeDetails(address collegeAddress) 
        external 
        view 
        returns (
            string memory name,
            bool isApproved,
            uint256 registeredAt,
            uint256 certificatesIssued
        ) 
    {
        College memory college = colleges[collegeAddress];
        return (
            college.name,
            college.isApproved,
            college.registeredAt,
            college.certificatesIssued
        );
    }
    
    /**
     * @dev Get total number of colleges
     * @return uint256 Total colleges
     */
    function getTotalColleges() external view returns (uint256) {
        return collegeList.length;
    }
    
    /**
     * @dev Get total number of certificates issued
     * @return uint256 Total certificates
     */
    function getTotalCertificates() external view returns (uint256) {
        return certificateHolders.length;
    }
    
    /**
     * @dev Get list of all college addresses
     * @return address[] Array of college addresses
     */
    function getAllColleges() external view returns (address[] memory) {
        return collegeList;
    }
}
