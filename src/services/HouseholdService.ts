import { v4 as uuidv4 } from 'uuid';
import {
    collection,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    getDocs,
    writeBatch,
    serverTimestamp,
    increment,
    getDoc,
    Timestamp,
    orderBy
} from 'firebase/firestore';
import { FIRESTORE_DB } from 'firebase.config';
import { HouseholdMember } from '@/entities/HouseholdMember';
import { Permissions } from '@/screens/HouseholdMembersScreen';
import { Household } from '@/entities/Household';
import { HouseholdInvite } from '@/entities/HouseholdInvite';

export default class HouseholdService {
    private static readonly collectionName = 'householdMembers';
    private static readonly householdsCol = 'households';
    private static readonly membersCol = 'householdMembers';
    private static readonly invitesCol = 'householdInvites';

    static async getMembers(householdId: string): Promise<HouseholdMember[]> {
        const q = query(
            collection(FIRESTORE_DB, this.collectionName),
            where('householdId', '==', householdId)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as HouseholdMember);
    }

    static streamMembers(
        userId: string,
        callback: (members: HouseholdMember[]) => void
    ): () => void {
        const q = query(
            collection(FIRESTORE_DB, this.collectionName),
            where('householdId', '==', userId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const members = querySnapshot.docs.map(doc => ({
                userId: doc.id as string,
                ...doc.data()
            }) as HouseholdMember);
            callback(members);
        });

        return unsubscribe;
    }

    static async addMember(
        userId: string,
        member: Omit<HouseholdMember, 'id' | 'permissions' | 'invited'>
    ): Promise<string> {
        const id = uuidv4();
        const memberRef = doc(FIRESTORE_DB, this.collectionName, id);

        await setDoc(memberRef, {
            ...member,
            householdId: userId,
            permissions: this.getDefaultPermissions(member.role),
            invited: false,
            createdAt: new Date().toISOString()
        });

        return id;
    }

    static async updateMember(
        id: string,
        updates: Partial<HouseholdMember>
    ): Promise<void> {
        const memberRef = doc(FIRESTORE_DB, this.collectionName, id);
        await updateDoc(memberRef, updates);
    }

    static async deleteMember(id: string): Promise<void> {
        const memberRef = doc(FIRESTORE_DB, this.collectionName, id);
        await deleteDoc(memberRef);
    }

    static async sendInvitation(
        id: string,
        contact: { email?: string; phone?: string }
    ): Promise<void> {
        const memberRef = doc(FIRESTORE_DB, this.collectionName, id);
        await updateDoc(memberRef, {
            invitationSent: true,
            invitationDate: new Date().toISOString(),
            ...contact
        });
    }

    private static getDefaultPermissions(role: HouseholdMember['role']): Partial<Permissions> {
        return {
            canEditTasks: role === 'parent' || role === 'guest',
            canManageMembers: role === 'parent',
            canApprovePurchases: role === 'parent'
        };
    }

    static async createHousehold(userId: string, name: string, address: string = ""): Promise<string> {
        const batch = writeBatch(FIRESTORE_DB);
        const householdId = uuidv4();

        const householdRef = doc(FIRESTORE_DB, this.householdsCol, householdId);
        batch.set(householdRef, {
            name,
            createdBy: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            membersCount: 1,
            photoURL: null,
            id: householdId,
            address: address,
            members: [],
            inviteCode: undefined,

        } as Household);

        const memberId = uuidv4();
        const memberRef = doc(FIRESTORE_DB, this.membersCol, memberId);
        batch.set(memberRef, {
            id: memberId,
            householdId,
            userId,
            name: '',
            role: 'parent',
            permissions: this.getOwnerPermissions(),
            joinedAt: serverTimestamp(),
            joinDate: Timestamp.now()
        } as HouseholdMember);

        await batch.commit();
        return householdId;
    }

    static async updateHousehold(householdId: string, updates: Partial<Household>) {
        const householdRef = doc(FIRESTORE_DB, this.householdsCol, householdId);
        await updateDoc(householdRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
    }

    static async deleteHousehold(householdId: string) {
        const batch = writeBatch(FIRESTORE_DB);

        // Delete household
        const householdRef = doc(FIRESTORE_DB, this.householdsCol, householdId);
        batch.delete(householdRef);

        // Delete all members
        const membersQuery = query(
            collection(FIRESTORE_DB, this.membersCol),
            where('householdId', '==', householdId)
        );
        const membersSnapshot = await getDocs(membersQuery);
        membersSnapshot.forEach(doc => batch.delete(doc.ref));

        // Delete all invites
        const invitesQuery = query(
            collection(FIRESTORE_DB, this.invitesCol),
            where('householdId', '==', householdId)
        );
        const invitesSnapshot = await getDocs(invitesQuery);
        invitesSnapshot.forEach(doc => batch.delete(doc.ref));

        await batch.commit();
    }

    // Invite Management
    static async generateInviteCode(householdId: string, creatorId: string, options: {
        expiresInHours?: number;
        maxUses?: number;
    } = {}) {
        const inviteRef = doc(FIRESTORE_DB, this.invitesCol, uuidv4());
        const expiresIn = options.expiresInHours || 72;

        await setDoc(inviteRef, {
            householdId,
            createdBy: creatorId,
            code: Math.random().toString(36).substr(2, 8).toUpperCase(),
            createdAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + expiresIn * 60 * 60 * 1000).toISOString(),
            usesRemaining: options.maxUses || 1,
            status: 'active'
        });

        return inviteRef.id as string;
    }

    static async joinHousehold(code: string, userId: string, userData: {
        name: string;
        email?: string;
        phone?: string;
    }) {
        const invitesQuery = query(
            collection(FIRESTORE_DB, this.invitesCol),
            where('code', '==', code),
            where('status', '==', 'active')
        );

        const snapshot = await getDocs(invitesQuery);
        if (snapshot.empty) throw new Error('Invalid or expired invite code');

        const invite = snapshot.docs[0].data() as HouseholdInvite;
        if (new Date(invite.expiresAt) < new Date()) {
            await updateDoc(snapshot.docs[0].ref, { status: 'expired' });
            throw new Error('Invite code has expired');
        }

        const batch = writeBatch(FIRESTORE_DB);

        const memberRef = doc(FIRESTORE_DB, this.membersCol, uuidv4());
        batch.set(memberRef, {
            householdId: invite.householdId,
            userId,
            ...userData,
            role: 'guest',
            permissions: this.getDefaultPermissions('guest'),
            joinedAt: serverTimestamp()
        });

        batch.update(snapshot.docs[0].ref, {
            usesRemaining: increment(-1),
            status: invite.usesRemaining === 1 ? 'used' : 'active'
        });

        const householdRef = doc(FIRESTORE_DB, this.householdsCol, invite.householdId);
        batch.update(householdRef, {
            membersCount: increment(1),
            updatedAt: serverTimestamp()
        });

        await batch.commit();
        return invite.householdId;
    }

    static streamUserHouseholds(userId: string, callback: (households: Household[]) => void) {
        const membersQuery = query(
            collection(FIRESTORE_DB, this.membersCol),
            where('userId', '==', userId)
        );

        return onSnapshot(membersQuery, async (membersSnapshot) => {
            const householdIds = membersSnapshot.docs
                .map(doc => doc.data().householdId);

            if (householdIds.length === 0) return callback([]);

            const householdsQuery = query(
                collection(FIRESTORE_DB, this.householdsCol),
                where('__name__', 'in', householdIds)
            );

            const householdsSnapshot = await getDocs(householdsQuery);
            const households = householdsSnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Household));

            callback(households);
        });
    }

    static async getHouseholdDetails(householdId: string) {
        const householdPromise = getDoc(doc(FIRESTORE_DB, this.householdsCol, householdId));
        const membersPromise = getDocs(query(
            collection(FIRESTORE_DB, this.membersCol),
            where('householdId', '==', householdId)
        ));

        const [householdSnap, membersSnap] = await Promise.all([householdPromise, membersPromise]);

        if (!householdSnap.exists()) throw new Error('Household not found');

        return {
            ...householdSnap.data() as Household,
            members: membersSnap.docs.map(doc => doc.data() as HouseholdMember)
        };
    }

    static async getHouseholdByUserId(userId: string) {
        const householdPromise = getDoc(doc(FIRESTORE_DB, this.householdsCol, userId));
        const membersPromise = getDocs(query(
            collection(FIRESTORE_DB, this.membersCol),
            where('userId', '==', userId)
        ));

        const [householdSnap, membersSnap] = await Promise.all([householdPromise, membersPromise]);

        if (!householdSnap.exists()) throw new Error('Household not found');

        return {
            ...householdSnap.data() as Household,
            members: membersSnap.docs.map(doc => doc.data() as HouseholdMember)
        };
    }

    static async getHouseholdsByUserId(userId: string): Promise<Household[]> {
        const membersQuery = query(
            collection(FIRESTORE_DB, this.membersCol),
            where('userId', '==', userId)
        );

        const membersSnapshot = await getDocs(membersQuery);
        if (membersSnapshot.empty) return [];

        const householdIds = membersSnapshot.docs.map(doc => doc.data().householdId);
        const householdsQuery = query(
            collection(FIRESTORE_DB, this.householdsCol),
            where('__name__', 'in', householdIds)
        );

        const householdsSnapshot = await getDocs(householdsQuery);
        return householdsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }) as Household);
    }

    private static getOwnerPermissions(): Permissions {
        return {
            canEditTasks: true,
            canManageMembers: true,
            canApprovePurchases: true,
            canDeleteHousehold: true
        };
    }

    static async verifyPermission(userId: string, householdId: string, permission: keyof Permissions) {
        const memberQuery = query(
            collection(FIRESTORE_DB, this.membersCol),
            where('userId', '==', userId),
            where('householdId', '==', householdId)
        );

        const snapshot = await getDocs(memberQuery);
        if (snapshot.empty) return false;

        const member = snapshot.docs[0].data() as HouseholdMember;
        return member.permissions[permission] === true;
    }

    static async revokeInvitation(inviteId: string): Promise<void> {
        const inviteRef = doc(FIRESTORE_DB, this.invitesCol, inviteId);
        await deleteDoc(inviteRef);
    }

    static async leaveHousehold(householdId: string, userId: string): Promise<void> {
        const batch = writeBatch(FIRESTORE_DB);

        // Find the member document
        const memberQuery = query(
            collection(FIRESTORE_DB, this.membersCol),
            where('householdId', '==', householdId),
            where('userId', '==', userId)
        );

        const memberSnapshot = await getDocs(memberQuery);
        if (memberSnapshot.empty) {
            throw new Error('Member record not found');
        }

        // Delete member document
        batch.delete(memberSnapshot.docs[0].ref);

        // Update household members count
        const householdRef = doc(FIRESTORE_DB, this.householdsCol, householdId);
        batch.update(householdRef, {
            membersCount: increment(-1),
            updatedAt: serverTimestamp()
        });

        await batch.commit();
    }

    static streamHouseholdInvites(
        householdId: string,
        callback: (invites: HouseholdInvite[]) => void
    ): () => void {
        const invitesQuery = query(
            collection(FIRESTORE_DB, this.invitesCol),
            where('householdId', '==', householdId),
            orderBy('expiresAt', 'asc')
        );

        const unsubscribe = onSnapshot(invitesQuery, (snapshot) => {
            const invites = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }) as HouseholdInvite);
            callback(invites);
        });

        return unsubscribe;
    }
}